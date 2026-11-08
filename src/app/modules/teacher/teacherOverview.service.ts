import prisma from '../../../db/db.config';

const getTeacherOverviewFromDB = async (teacherId: string) => {
  const response = await prisma.$transaction(async (prisma) => {
    const totalApproveLeaves = await prisma.teacherLeaveRequest.count({
      where: {
        leave_status: 'APPROVED',
        teacher_id: teacherId,
      },
    });

    const totalPendingLeaves = await prisma.teacherLeaveRequest.count({
      where: {
        leave_status: 'PENDING',
        teacher_id: teacherId,
      },
    });

    const totalRejectedLeaves = await prisma.teacherLeaveRequest.count({
      where: {
        leave_status: 'REJECTED',
        teacher_id: teacherId,
      },
    });

    const totalAttendanceRecords = await prisma.teacherAttendance.count({
      where: {
        teacher_id: teacherId,
      },
    });

    const totalPresentRecords = await prisma.teacherAttendance.count({
      where: {
        teacher_id: teacherId,
        attendance_status: 'PRESENT',
      },
    });

    const totalAbsentRecords = await prisma.teacherAttendance.count({
      where: {
        teacher_id: teacherId,
        attendance_status: 'ABSENT',
      },
    });

    const averageAttendancePercentage =
      totalAttendanceRecords > 0
        ? Number(
            ((totalPresentRecords / totalAttendanceRecords) * 100).toFixed(2),
          )
        : 0;
    const averageAbsentPercentage =
      totalAttendanceRecords > 0
        ? Number(
            ((totalAbsentRecords / totalAttendanceRecords) * 100).toFixed(2),
          )
        : 0;

    const totalOvertimeHours = await prisma.teacherOvertime.aggregate({
      where: {
        teacher_id: teacherId,
        created_at: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        },
      },
      _sum: {
        overtime_hours: true,
      },
    });

    return {
      totalApproveLeaves,
      totalPendingLeaves,
      totalRejectedLeaves,
      averageAttendancePercentage,
      averageAbsentPercentage,
      totalOvertimeHours: Number(
        (totalOvertimeHours._sum.overtime_hours || 0).toFixed(2),
      ),
    };
  });

  return response;
};

export const teacherOverviewService = {
  getTeacherOverviewFromDB,
};
