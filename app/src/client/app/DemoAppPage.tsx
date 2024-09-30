import React, { useEffect, useState } from 'react';
import { type Task, type User } from 'wasp/entities';
import { deleteTask, createTask, useQuery, getAllTasksByUser } from 'wasp/client/operations';
import { usePapaParse } from 'react-papaparse';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { TiDelete } from 'react-icons/ti';
import { Button as NextUIButton } from '@nextui-org/react';
import { importmail } from 'wasp/client/operations';
import Avatar from '@mui/material/Avatar';
import '../Main.css'
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Modal from '@mui/material/Modal';
import { styled } from '@mui/material/styles';

export default function DemoAppPage({ user }: { user: User }) {
  const [verified, setVerified] = useState<boolean>(false);

  useEffect(() => {
    handleMailExtractClick();
    if (user.sendEmail === true) {
      setVerified(true);
    }
  }, [user.sendEmail]);

  const handleMailExtractClick = async () => {
    const data = user.username;
    const userId = user.id;
    console.log('this is userid', userId);
    await importmail({ data, userId });
  };

  return (
    <div>
      <div className='mx-auto my-auto'>
        <div className='w-11/12 mx-auto my-auto'>
          {verified ? (
            <div className='w-full mx-auto my-auto '>
              <NewTaskForm handleCreateTask={createTask} />
            </div>
          ) : (
            <h1>Verify your email first then reload the page</h1>
          )}
        </div>
      </div>
    </div>
  );
}

function NewTaskForm({ handleCreateTask }: { handleCreateTask: typeof createTask }) {
  const [description, setDescription] = useState<string>('');
  const [name, setName] = useState<string>('faiz');
  const [email, setEmail] = useState<string>('faizshariff540@gmail.com');
  const [subscribed, setSubscribed] = useState<boolean>(true);
  const [tag, setTag] = useState<string>('marketing');
  const { data: tasks, isLoading: isTasksLoading } = useQuery(getAllTasksByUser);
  const { readString } = usePapaParse();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);

  const NoBorderTextField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: 'none',
      },
    },
  });
  
  const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '35%',
    bgcolor: 'background.paper',
    borderRadius: '16px',
    p: 4,
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 150, renderCell: (params) => (
      <div className='flex  items-center'>
        <Avatar 
          src={params.row.logoUrl} 
          alt={params.row.name} 
          className='mr-4'
        >
          {params.row.name?.charAt(0)}
        </Avatar>
        <h1 className='font-Inter font-bold '>{params.row.name}</h1>
      </div>
    )},
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 120,
      flex: 1,
      renderCell: (params) => <Typography>{params.row.Status}</Typography>,
    },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'number', headerName: 'Number', width: 200 },
    { field: 'location', headerName: 'location', width: 200 },
    {
      field: 'tag',
      headerName: 'Tag',
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <Chip label={params.row.tag} style={{ backgroundColor: '#444CF7', color: 'white' }} />
      ),
    },
    { field: 'description', headerName: 'Website', width: 250 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params) => (
        <NextUIButton
          onClick={() => handleDeleteClick(params.row.id)}
          className='text-red-600 hover:text-red-700'
        >
          <TiDelete size='20' />
        </NextUIButton>
      ),
    },
  ];

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleOpen2 = () => setOpen2(true);
  const handleClose2 = () => setOpen2(false);

  const handleOpen3 = () => setOpen3(true);
  const handleClose3 = () => setOpen3(false);

  const handleDeleteClick = async (id: string) => {
    await deleteTask({ id });
  };

  const handleFileUpload = async (e: any) => {
    try {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      const file = formData.get('file-upload') as File;
      if (!file || !file.name || !file.type) {
        throw new Error('No file selected');
      }
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = () => {
        const fileContent = reader.result as string;
        readString(fileContent, {
          header: true,
          dynamicTyping: true,
          complete: async (results: any) => {
            for (const row of results.data) {
              if (!row.name || !row.email || !row.Tag) {
                console.log('Skipping row: Required fields missing');
                continue;
              }
              const subscribeValue = /true/.test(row.Subscribed);
              const descriptionValue = row.description;
              const nameValue = row.name;
              const emailValue = row.email;
              const tagValue = row.Tag;
              try {
                await handleCreateTask({
                  description: descriptionValue,
                  name: nameValue,
                  email: emailValue,
                  Subscribed: subscribeValue,
                  Tag: tagValue,
                });
              } catch (error) {
                console.error('Error processing row:', error);
              }
            }
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
          },
        });
      };
      reader.readAsText(file);
    } catch (error) {
      console.log('Error uploading file. Please try again');
      console.error('Error uploading file', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    try {
      const namedata = event.target.name.value;
      const emaildata = event.target.email.value;
      const tagdata = event.target.tag.value;
      if (!namedata || !emaildata || !tagdata) {
        console.log('Required fields missing');
        return;
      }
      await handleCreateTask({
        description,
        name: namedata,
        email: emaildata,
        Subscribed: subscribed,
        Tag: tagdata,
      });
      setDescription('');
      setName('');
      setEmail('');
      setSubscribed(true);
      setTag('');
    } catch (err: any) {
      window.alert('Error: ' + (err.message || 'Something went wrong'));
    }
  };

  const sortedTasks = tasks?.slice().sort((a: Task, b: Task) => {
    if (a.Tag < b.Tag) return -1;
    if (a.Tag > b.Tag) return 1;
    return 0;
  });

  const rows = sortedTasks?.map((task) => ({
    id: task.id,
    name: task.name,
    email: task.email,
    tag: task.Tag,
    description: task.description,
  }));

  return (
    <div className='flex justify-center items-center w-full h-full min-h-screen '>
      <div className='border rounded-md w-full h-full '>
        <div className='w-10/12 p-4 flex mx-auto justify-between mb-4'>
          <NextUIButton className='bg-[#000] text-white' onClick={handleOpen2}>Add Contact</NextUIButton>
          <NextUIButton className='bg-[#000] text-white' onClick={handleOpen}>Upload File</NextUIButton>
          <NextUIButton className='bg-[#000] text-white' onClick={handleOpen3}>Add Tag</NextUIButton>
        </div>

        {/* Modals */}
        <Modal open={open} onClose={handleClose}>
          <Box sx={style}>
            <div className='space-y-48'>
              <form onSubmit={handleFileUpload} className='border rounded-lg p-8 flex flex-col gap-2'>
                <input type='file' name='file-upload' accept='.pdf, .csv, text/*' className='text-gray-600 mb-12' />
                <NextUIButton type='submit' className='bg-[#000] w-full text-white cursor-pointer flex items-center gap-1 border text-lg rounded-lg' disabled={isLoading}>
                  {isLoading ? 'Uploading...' : 'Upload'}
                </NextUIButton>
              </form>
            </div>
          </Box>
        </Modal>

        <Modal open={open2} onClose={handleClose2}>
          <Box sx={style}>
            <div className='flex flex-col items-center border rounded-lg p-8 justify-between gap-3'>
              <Box component='form' onSubmit={handleSubmit} className='flex flex-col gap-4'>
                <div className='flex flex-col gap-4'>
                  <TextField id='tag' name='tag' label='Tag' variant='outlined' value={tag} onChange={(e) => setTag(e.target.value)} fullWidth />
                  <TextField id='name' name='name' label='Name' variant='outlined' value={name} onChange={(e) => setName(e.target.value)} fullWidth />
                  <TextField id='email' name='email' label='Email' variant='outlined' value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
                </div>
                <NextUIButton type='submit' className='bg-[#000] w-48 text-white cursor-pointer flex items-center gap-1 border text-lg rounded-lg' disabled={isLoading}>
                  {isLoading ? 'Adding Task...' : 'Add Task'}
                </NextUIButton>
              </Box>
            </div>
          </Box>
        </Modal>

        <Modal open={open3} onClose={handleClose3}>
          <Box sx={style}>
            <div>
              <h1>hello</h1>
            </div>
          </Box>
        </Modal>

        {/* Data Table */}
        <div className='w-full flex justify-center items-center'>
          {isTasksLoading && <div>Loading...</div>}
          {sortedTasks && sortedTasks.length > 0 ? (
            <div className='w-full space-y-4'>
              <DataGrid rows={rows} columns={columns} initialState={{ pagination: { paginationModel: { page: 0, pageSize: 5 } } }} pageSizeOptions={[15, 30]} checkboxSelection />
            </div>
          ) : (
            <div className='text-gray-600 text-center'>Add Contacts to begin</div>
          )}
        </div>
      </div>
    </div>
  );
}
