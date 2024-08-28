const prisma = require("../../prisma");
const { Prisma } = require('@prisma/client');

const subServicesController = {
    createSubService: async (req, res) => {
        try {
            const { name, description, serviceId } = req.body;
            const subService = await prisma.subService.create({
                data: {
                    name,
                    description,
                    service: { connect: { id: Number(serviceId) } }
                }
            });
            res.status(201).json({ message: "SubService created successfully", subService });
        } catch (error) {
            handlePrismaError(error, res);
        }
    },
    createManySubServices: async (req, res) => {
        try {
            const { subServices } = req.body;
            if (!Array.isArray(subServices) || subServices.length === 0) {
                return res.status(400).json({ message: "Invalid input: subServices must be a non-empty array" });
            }

            const createdSubServices = await prisma.subService.createMany({
                data: subServices.map(subService => ({
                    name: subService.name,
                    description: subService.description,
                    serviceId: Number(subService.serviceId)
                })),
                skipDuplicates: true
            });

            res.status(201).json({ 
                message: "SubServices created successfully", 
                count: createdSubServices.count 
            });
        } catch (error) {
            handlePrismaError(error, res);
        }
    },

    getAllSubServices: async (req, res) => {
        try {
            const subServices = await prisma.subService.findMany({
                include: { service: true, prices: true }
            });
            if (subServices.length === 0) {
                return res.status(404).json({ message: "No SubServices found" });
            }
            res.status(200).json({ subServices });
        } catch (error) {
            handlePrismaError(error, res);
        }
    },

    getSubService: async (req, res) => {
        try {
            const { id } = req.params;
            const subService = await prisma.subService.findUnique({
                where: { id: Number(id) },
                include: { service: true, prices: true }
            });
            if (!subService) {
                return res.status(404).json({ message: "SubService not found" });
            }
            res.status(200).json({ subService });
        } catch (error) {
            handlePrismaError(error, res);
        }
    },

    updateSubService: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, description, serviceId } = req.body;
            const subService = await prisma.subService.update({
                where: { id: Number(id) },
                data: {
                    name,
                    description,
                    service: serviceId ? { connect: { id: Number(serviceId) } } : undefined
                }
            });
            res.status(200).json({ message: "SubService updated successfully", subService });
        } catch (error) {
            handlePrismaError(error, res);
        }
    },

    deleteSubService: async (req, res) => {
        try {
            const { id } = req.params;
            await prisma.subService.delete({
                where: { id: Number(id) }
            });
            res.status(200).json({ message: 'SubService deleted successfully' });
        } catch (error) {
            handlePrismaError(error, res);
        }
    }
};

function handlePrismaError(error, res) {
    console.error(error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle known Prisma errors
        switch (error.code) {
            case 'P2002':
                return res.status(409).json({ message: "A unique constraint would be violated on SubService. Details: " + error.meta.target });
            case 'P2025':
                return res.status(404).json({ message: "Record not found" });
            case 'P2003':
                return res.status(400).json({ message: "Foreign key constraint failed on the field: " + error.meta.field_name });
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

module.exports = { subServicesController };