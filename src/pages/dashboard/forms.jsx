import React, { useState } from 'react';
import { authorsTableData } from "@/data";
import MyTable from '@/components/MyTable';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Avatar,
  Chip,
  Tooltip,
  Progress,
} from "@material-tailwind/react";
import DeleteIcon from '@mui/icons-material/Delete';
import SecurityIcon from '@mui/icons-material/Security';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import { GridActionsCellItem } from '@mui/x-data-grid';

export function Forms () {
  const [loading, setLoading] = useState(false);
  
  const columns = [
    {
      field: 'name',
      headerName: 'Author',
      width: 300,
      renderCell: ({value, row}) => (
        <div className="flex items-center gap-4 py-3">
          <Avatar src={row.img} alt={value} size="sm" variant="rounded" />
          <div>
            <Typography variant="small" color="blue-gray" className="font-semibold">
              {value}
            </Typography>
            <Typography className="text-xs font-normal text-blue-gray-500">
              {row.email}
            </Typography>
          </div>
        </div>
      )
    },
    {
      field: 'job',
      headerName: 'Function',
      width: 200,
      renderCell: ({value, row}) => (
        <div className='py-3'>
          <Typography className="text-xs font-semibold text-blue-gray-600">
            {value[0]}
          </Typography>
          <Typography className="text-xs font-normal text-blue-gray-500">
            {value[1]}
          </Typography>
        </div>
      )
    },
    { field: 'date', headerName: 'Employed', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    {
      field: 'online',
      headerName: 'Status',
      width: 100,
      align: "center",
      renderCell: ({value}) => (
        <div className='py-3'>
          <Chip
            variant="gradient"
            color={value ? "green" : "blue-gray"}
            value={value ? "online" : "offline"}
          />
        </div>
      )
    }
  ];

  const deleteUser = (id) => { console.log("DELETING_USER", id) }
  const toggleAdmin = (id) => { }
  const duplicateUser = (id) => { }

  const actions = [
    {
      icon: <DeleteIcon />,
      label: 'Delete',
      onClick: deleteUser,
    },
    {
      icon: <SecurityIcon />,
      label: 'Toggle Admin',
      onClick: toggleAdmin,
      showInMenu: true,
    },
    {
      icon: <FileCopyIcon />,
      label: 'Duplicate User',
      onClick: duplicateUser,
      showInMenu: true,
    },
  ]

  return (
    <div className="mt-10 mb-8 flex flex-col gap-12">
      <MyTable 
        data={authorsTableData}
        columns={columns}
        actions={actions}
        loading={loading}
        rowHeight={60}
        checkboxSelection={true}
      />
    </div>
  );
};

export default Forms;