const prisma = require("../../prisma");
const { Prisma } = require('@prisma/client');

const jobController = {
    createJob: async (req, res) => {
        try {
            const { serviceId, selectedSubServices, currency, dropboxLink, instructions } = req.body;

            // Validate client exists
            const clientId = req.user.id;
            if (!clientId) {
                return res.status(404).json({ message: "Client not found" });
            }

            // Validate service exists
            const service = await prisma.service.findUnique({ where: { id: Number(serviceId) } });
            if (!service) {
                return res.status(404).json({ message: "Service not found" });
            }

            // Fetch subservices and their prices
            const subServices = await prisma.subService.findMany({
                where: {
                    id: { in: selectedSubServices.map(Number) },
                    serviceId: Number(serviceId)
                },
                include: { prices: true },
            });

            if (subServices.length !== selectedSubServices.length) {
                return res.status(400).json({ message: "Invalid subservice selection" });
            }

            // Calculate total price
            let totalPrice = 0;
            for (const subService of subServices) {
                const price = subService.prices.find(p => p.currency === currency);
                if (!price) {
                    return res.status(400).json({ message: `Price not available for ${subService.name} in ${currency}` });
                }
                totalPrice += Number(price.price);
            }

            // Create job
            const job = await prisma.job.create({
                data: {
                    clientId: Number(clientId),
                    subServiceId: Number(subServices[0].id), // Assuming we need to set one subServiceId
                    totalPrice,
                    currency,
                    dropboxLink,
                    instructions,
                    status: 'PENDING',
                },
                include: {
                    user: true,
                    subService: true
                }
            });

            res.status(201).json({ message: "Job created successfully", job });
        } catch (error) {
            handlePrismaError(error, res);
        }
    },

    getAllJobs: async (req, res) => {
        try {
            const jobs = await prisma.job.findMany({
                include: { user: true, subService: true }
            });
            if (jobs.length === 0) {
                return res.status(404).json({ message: "No jobs found" });
            }
            res.status(200).json({ jobs });
        } catch (error) {
            handlePrismaError(error, res);
        }
    },

    getJob: async (req, res) => {
        try {
            const { id } = req.params;
            const job = await prisma.job.findUnique({
                where: { id: Number(id) },
                include: { user: true, subService: true }
            });
            if (!job) {
                return res.status(404).json({ message: "Job not found" });
            }
            res.status(200).json({ job });
        } catch (error) {
            handlePrismaError(error, res);
        }
    },

    updateJob: async (req, res) => {
        try {
            const { id } = req.params;
            const { status, dropboxLink, instructions } = req.body;
            const job = await prisma.job.update({
                where: { id: Number(id) },
                data: {
                    status,
                    dropboxLink,
                    instructions
                },
                include: { user: true, subService: true }
            });
            res.status(200).json({ message: "Job updated successfully", job });
        } catch (error) {
            handlePrismaError(error, res);
        }
    },

    deleteJob: async (req, res) => {
        try {
            const { id } = req.params;
            await prisma.job.delete({
                where: { id: Number(id) }
            });
            res.status(200).json({ message: 'Job deleted successfully' });
        } catch (error) {
            handlePrismaError(error, res);
        }
    },
    assignJob: async (req, res) => {
        try {
            const { jobId, editorId } = req.body;
            const job = await prisma.job.findUnique({
                where: {
                    id: jobId
                }
            })
            if (!job) {
                return res.status(404).json({ error: 'Job not found' });
            }
            if (job.assignedToId) {
                return res.status(400).json({ error: 'Job is already assigned' });
            }

            const admin = await prisma.admin.findUnique({
                where:{
                    id:editorId
                }
            })

            if (!admin) {
                return res.status(404).json({ error: 'Admin not found' });
            }

            if (admin.role !== 'EDITOR') {
                return res.status(403).json({ error: 'Only EDITOR admins can be assigned jobs' });
            }

            const assignedJob = await prisma.job.update({
                where:{id:jobId},
                data:{
                    assignedTo:{connect:{id:editorId}},
                    status:"IN_PROGRESS",
                    assignedAt: new Date()
                },
                include:{
                    assignedTo:true
                }
            })
            res.status(201).json({"message":"Job asssigned Succesfully",assignedJob});
        } catch (error) {
             handlePrismaError(error,res)
        }

    },
    changeJobStatus:async ( req,res) => {
        const jobId  = req.params.id;
        const { status, progress, editorDropboxLink } = req.body;
        const editorId = req.user.id; // Assuming you have authentication middleware that sets req.user
      
        try {
          // Fetch the job
          const job = await prisma.job.findUnique({
            where: { id: parseInt(jobId) },
            include: { assignedTo: true }
          });
      
          if (!job) {
            return res.status(404).json({ error: 'Job not found' });
          }
      
          // Check if the editor is assigned to this job
          if (job.editorId !== editorId) {
            return res.status(403).json({ error: 'You are not authorized to update this job' });
          }
      
          // Prepare update data
          const updateData = {};
      
          if (status) {
            // Validate status
            if (!['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(status)) {
              return res.status(400).json({ error: 'Invalid status' });
            }
            updateData.status = status;
          }
      
          if (progress !== undefined) {
            // Validate progress
            if (progress < 0 || progress > 100) {
              return res.status(400).json({ error: 'Progress must be between 0 and 100' });
            }
            updateData.progress = progress;
          }
      
          if (status === 'COMPLETED') {
            if (!editorDropboxLink) {
              return res.status(400).json({ error: 'Editor Dropbox link is required when completing a job' });
            }
            updateData.editorDropboxLink = editorDropboxLink;
          }
      
          // Update the job
          const updatedJob = await prisma.job.update({
            where: { id: parseInt(jobId) },
            data: updateData
          });
      
          res.json({
            message: 'Job updated successfully',
            job: updatedJob
          });
      
        } catch (error) {
          console.error('Error updating job:', error);
          res.status(500).json({ error: 'An error occurred while updating the job' });
        }
    }
};

function handlePrismaError(error, res) {
    console.error(error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case 'P2002':
                return res.status(409).json({ message: "A unique constraint would be violated on Job. Details: " + error.meta.target });
            case 'P2025':
                return res.status(404).json({ message: "Record not found" });
            case 'P2003':
                return res.status(400).json({ message: "Foreign key constraint failed on the field: " + error.meta.field_name });
            default:
                return res.status(400).json({ message: "Database error", error: error.message });
        }
    } else if (error instanceof Prisma.PrismaClientValidationError) {
        return res.status(400).json({ message: "Validation error", error: error.message });
    } else {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

module.exports = { jobController };