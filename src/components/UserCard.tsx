import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card'
import { Activity } from 'lucide-react'

const UserCard = ({ type, count }: { type: string, count: number }) => {
  const academicYear = "2024/25"; // Can be dynamic if needed

  return (
    <Card className='rounded-2xl flex-1 min-w-[130px] bg-card hover:shadow-md transition-shadow'>
      <CardContent className='flex justify-between items-center pt-6'>
        <p className='text-[10px] px-2 py-1 rounded-full border bg-muted font-semibold'>{academicYear}</p>
        <Activity className="w-5 h-5 text-muted-foreground" />
      </CardContent>
      <CardHeader>
        <CardTitle className='text-2xl font-bold my-2'>{count?.toLocaleString()}</CardTitle>
        <CardDescription className='capitalize text-sm font-medium'>
          {type}s
        </CardDescription>
      </CardHeader>
    </Card>
  )
}

export default UserCard
