const prisma = require("../../prisma");
const { Prisma } = require('@prisma/client');

const jobController = {
    createJob: async (req, res) => {
        try {
            const {  serviceId, selectedSubServices, currency, dropboxLink, instructions } = req.body;

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