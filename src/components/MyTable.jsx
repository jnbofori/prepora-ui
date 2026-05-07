import * as React from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';

export default function MyTable({ 
  loading,
  data,
  columns,
  actions,
  rowHeight = 52,
  checkboxSelection = false,
  ...props 
}) {
  const styles = {
    borderRadius: '0.75rem',
    '& .MuiDataGrid-columnSeparator': {
      visibility: 'hidden'
    },
  }

  const gridColumns = [...columns];
  if (actions) {
    gridColumns.push({
      field: 'actions',
      type: 'actions',
      width: 85,
      getActions: (params) => {
        return actions.map((action) => {
          return (
            <GridActionsCellItem
              icon={action.icon}
              label={action.label}
              onClick={() => action.onClick(params.id)}
              showInMenu={!!action.showInMenu}
            />
          )
        })
      }
    });
  }

  return (
    <div style={{ height: "100%", width: '100%'}}>
      <DataGrid
        className='shadow-md'
        sx={styles}
        rows={data}
        columns={gridColumns}
        pageSize={5}
        rowsPerPageOptions={[10]}
        loading={loading}
        rowHeight={rowHeight}
        checkboxSelection={checkboxSelection}
        showToolbar
        disableColumnResize
        disableColumnFilter
        {...props}
      />
    </div>
  );
}