const { Prisma } = require('@prisma/client');
const prisma = require('../../prisma');


const serviceController = {
    creatService: async (req, res) => {
        try {
            const { name, description } = req.body;
            const service = await prisma.service.create({
                data: {
                    name: name,
                    description: description
                }
            })
            if (!service) return res.status(404).json({ "message": "Error while adding service" })
            res.status(201).json({ "message": "service created successfully", service });
        } catch (error) {
            handlePrismaError(error,res);
        }

    },
    getAllServices: async (req, res) => {
        try {
            const services = await prisma.service.findMany({
                include: { subServices: true }
            });
            if (!services) return res.status(401).json({ "message": "No services found" })
            res.status(201).json({ services });
        } catch (error) {
            handlePrismaError(error,res);
        }

    },
    getAllFullServices: async (req, res) => {
        try {
            const services = await prisma.service.findMany({
                include: { subServices: {
                    include:{
                        prices:true
                    }
                } }
            });
            if (!services) return res.status(401).json({ "message": "No services found" })
            res.status(201).json({ services });
        } catch (error) {
            handlePrismaError(error,res);
        }

    },
    getService: async (req,res) => {
        try {
            const { id } = req.params;
            const service = await prisma.service.findUnique({
                where: {
                    id: Number(id)
                }
            })
            if (!service) return res.status(404).json({ "message": "Service not found!!" });
            res.status(201).json({ service });

        } catch (error) {
            handlePrismaError(error,res);
        }
    },
    updateService: async (req, res) => {
        const { id } = req.params;
        const { name, description } = req.body;
        try {
            const service = await prisma.service.update({
                where: { id: Number(id) },
                data: { name, description }
            });
            res.json(service);
        } catch (error) {
            handlePrismaError(error,res);
        }
    },
    deleteService : async (req, res) => {
        const { id } = req.params;
        try {
          await prisma.service.delete({
            where: { id: Number(id) }
          });
          res.json({ message: 'Service deleted successfully' });
        } catch (error) {
            handlePrismaError(error,res);
        }
      },
}

function handlePrismaError(error, res) {
    console.error(error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle known Prisma errors
        switch (error.code) {
            case 'P2002':
                return res.status(409).json({ message: "A unique constraint would be violated on Service. Details: " + error.meta.target });
            case 'P2025':
                return res.status(404).json({ message: "Record not found" });
            default:
                return res.status(400).json({ message: "Database error", error: error.message });
        }
    } else if (error instanceof Prisma.PrismaClientValidationError) {
        // Handle validation errors
        return res.status(400).json({ message: "Validation error", error: error.message });
    } else {
        // Handle other types of errors
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
module.exports ={serviceController};