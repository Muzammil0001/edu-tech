import { AttendanceChart } from '@/components/AttendanceChart'
import { CountChart } from '@/components/CountChart'
import { EventCalendar } from '@/components/EventCalendar'
import { FinanceChart } from '@/components/FinanceChart'
import UserCard from '@/components/UserCard'
import React from 'react'
import Announcements from '@/components/Announcements';
import prisma from '@/lib/prisma';

const Admin = async () => {
    let studentCount = 0;
    let teacherCount = 0;
    let parentCount = 0;
    let adminCount = 0;

    try {
        studentCount = await prisma.student.count();
        teacherCount = await prisma.teacher.count();
        parentCount = await prisma.parent.count();
        adminCount = await prisma.admin.count();
    } catch (error) {
        console.error("Failed to fetch admin dashboard counts:", error);
    }

    return (
        <div className='p-4 flex gap-4 flex-col md:flex-row'>
            <div className='w-full lg:w-2/3 flex flex-col gap-8'>
                <div className='flex gap-4 justify-between flex-wrap'>
                    <UserCard type='student' count={studentCount} />
                    <UserCard type='teacher' count={teacherCount} />
                    <UserCard type='parent' count={parentCount} />
                    <UserCard type='staff' count={adminCount} />
                </div>
                <div className='flex gap-4 flex-col lg:flex-row'>
                    <div className='w-full lg:w-1/3 h-[450px]'>
                        <CountChart />
                    </div>
                    <div className='w-full lg:w-2/3 h-[450px]'>
                        <AttendanceChart />
                    </div>
                </div>
                <div className='w-full h-[500px]'>
                    <FinanceChart />
                </div>
            </div>
            <div className='w-full lg:w-1/3 flex flex-col gap-8'>
                <EventCalendar />
                <Announcements />
            </div>

        </div>
    )
}

export default Admin