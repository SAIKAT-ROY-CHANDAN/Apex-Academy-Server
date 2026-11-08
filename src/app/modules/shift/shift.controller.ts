import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ShiftService } from "./shift.service";

const createShift = catchAsync(async (req, res) => {
    const response = await ShiftService.createShiftIntoDB(req.body);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Shift created successfully",
        data: response,
    });
});

const getAllShifts = catchAsync(async (req, res) => {
    const {meta, data} = await ShiftService.getAllShiftsFromDB(req.query);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Shifts retrieved successfully",
        meta,
        data,
    });
}); 

const getShiftById = catchAsync(async (req, res) => {
    const response = await ShiftService.getShiftByIdFromDB(req.params.id as string);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Shift retrieved successfully",
        data: response,
    });
});

const updateShift = catchAsync(async (req, res) => {
    const response = await ShiftService.updateShiftIntoDB(req.params.id as string, req.body);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Shift updated successfully",
        data: response,
    });
});

const deleteShift = catchAsync(async (req, res) => {
    const response =await ShiftService.deleteShiftFromDB(req.params.id as string);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Shift deleted successfully",
        data: response,
    });
});

export const ShiftController = {
    createShift,
    getAllShifts,
    getShiftById,
    updateShift,
    deleteShift,
};

