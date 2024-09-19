import React, { useEffect, useState } from 'react';
import { type Task, type User } from 'wasp/entities';
import { deleteTask, createTask, useQuery, getAllTasksByUser } from 'wasp/client/operations';
import { usePapaParse } from 'react-papaparse';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { TiDelete } from 'react-icons/ti';
import { Button as NextUIButton } from '@nextui-org/react';
import { importmail } from 'wasp/client/operations';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

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
    <div className='py-10 lg:mt-10'>
      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        <div className='w-full my-8'>
          {verified ? (
            <div className='w-full py-10 px-6 mx-auto my-8 space-y-10'>
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

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 130 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'tag', headerName: 'Tag', width: 130 },
    { field: 'description', headerName: 'Description', width: 250 },
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
    <div className='flex flex-col justify-center gap-10'>
      <div className='flex flex-row gap-4 w-full justify-between'>
        <div className='space-y-48'>
          <form onSubmit={handleFileUpload} className='border rounded-lg p-8 flex flex-col gap-2'>
            <input
              type='file'
              name='file-upload'
              accept='.pdf, .csv, text/*'
              className='text-gray-600 mb-12'
            />
            <NextUIButton
              type='submit'
              className='bg-[#000] w-full text-white cursor-pointer flex items-center gap-1 border text-lg rounded-lg'
              disabled={isLoading}
              >
              {isLoading ? 'Uploading...' : 'Upload'}
              </NextUIButton>
              </form>
              </div>
              <div className='flex items-center border rounded-lg p-8 justify-between gap-3'>
              <Box component='form' onSubmit={handleSubmit} className='flex flex-col gap-4'>
              <div className='flex flex-row gap-4'>
              <TextField
              id='tag'
              name='tag'
              label='Tag'
              variant='outlined'
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              fullWidth
              />
              <TextField
              id='name'
              name='name'
              label='Name'
              variant='outlined'
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              />
              <TextField
              id='email'
              name='email'
              label='Email'
              variant='outlined'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              />
              </div>
              <NextUIButton
                         type='submit'
                         className='bg-[#000] w-48 text-white cursor-pointer flex items-center gap-1 border text-lg rounded-lg'
                         disabled={isLoading}
                       >
              {isLoading ? 'Adding Task...' : 'Add Task'}
              </NextUIButton>
              </Box>
              </div>
              </div>
              <div className='space-y-10 col-span-full'>
              {isTasksLoading && <div>Loading...</div>}
              {sortedTasks && sortedTasks.length > 0 ? (
              <div className='space-y-4'>
              <DataGrid
              rows={rows}
              columns={columns}
              initialState={{
              pagination: {
              paginationModel: { page: 0, pageSize: 5 },
              },
              }}
              pageSizeOptions={[15, 30]}
              checkboxSelection
              />
              </div>
              ) : (
              <div className='text-gray-600 text-center'>Add Contacts to begin</div>
              )}
              </div>
              </div>
              );
              }
