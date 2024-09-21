import React, { useState, useEffect } from 'react';
import { useQuery } from 'wasp/client/operations';
import { getCampaigns, getAllTasksByUser, importmail } from 'wasp/client/operations';
import { useHistory } from 'react-router-dom';
import { type User } from 'wasp/entities';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Divider from '@mui/material/Divider';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';

import { Button } from "@nextui-org/react";
import {Chip, } from "@nextui-org/react";
import { styled } from '@mui/material/styles';
import EmailStatusChart from '../components/Emailcharts';

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

const FileUploadPage = ({ user }: { user: User }) => {
  const [open, setOpen] = useState(false);
  const [verified, setVerified] = useState<boolean>(false);
  const [contact, setContact] = useState<string | null>(null);
  const [template, setTemplate] = useState<any>('');
  const [nameData, setNameData] = useState<string>('');
  const [subjectData, setSubjectData] = useState<string>('');
  const [time, setTime] = useState<any>(null);
  const [schedule, setSchedule] = useState<boolean>(false);

  const { data: campaigns, isLoading: isCampaignsLoading } = useQuery(getCampaigns);
  const { data: tasks, isLoading: isTasksLoading } = useQuery(getAllTasksByUser);

  const history = useHistory();

  useEffect(() => {
    if (user.sendEmail) {
      setVerified(true);
    }
    handleMailExtractClick();
  }, []);

  const handleMailExtractClick = async () => {
    const { username, id } = user;
    await importmail({ data: username, userId: id });
  };


  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (event: SelectChangeEvent) => {
    setTemplate(event.target.value as string);
  };

  const handleCampaign = async () => {
    const dataToPass : any = {
      name: nameData,
      subject: subjectData,
      list: contact,
      template,
      schedule: schedule ? time.toISOString() : ''
    };
    const queryParams = new URLSearchParams(dataToPass).toString();
    history.push(`/write?${queryParams}`);
  };

  const uniqueTags = Array.from(new Set(tasks?.map((task: any) => task.Tag) || []));
  const sortedUniqueTags = uniqueTags.sort();

  const sortedCampaigns = campaigns?.slice().sort((a: any, b: any) => (a.Tag < b.Tag ? -1 : 1));

  return (
    <div>
      {verified ? (
        <>
          <div className="mt-12">
            <div className='flex flex-row content-center'>
          <h2 className=' ml-4 mb-12 mr-4 text-3xl font-semibold tracking-tight text-gray-900 '>
            MailBoard              
          </h2>
          <Chip className='mt-1' color="warning" variant="solid"><h1 className='text-white'>New</h1></Chip>
          </div>
            <Modal open={open} onClose={handleClose}>
              <Box sx={style}>
              <Typography sx={{
                marginBottom : '12px'
              }} className="text-center" id="modal-modal-title" variant="h6" component="h2">
                  Create Campaign
                </Typography>
                <Divider className="my-4 " style={{ borderWidth: '1px',  marginBottom: '32px', }} />
                <NoBorderTextField
                  fullWidth
                  variant="outlined"
                  label="Name"
                  value={nameData}
                  onChange={(e) => setNameData(e.target.value)}
                  style={{ marginBottom: '16px' }}
                />
                <NoBorderTextField
                  fullWidth
                  variant="outlined"
                  label="Subject"
                  value={subjectData}
                  onChange={(e) => setSubjectData(e.target.value)}
                  style={{ marginBottom: '16px' }}
                />
                <FormControl fullWidth style={{ marginBottom: '16px' }}>
                  <InputLabel>List</InputLabel>
                  <Select value={contact} onChange={(e) => setContact(e.target.value as string)}>
                    {sortedUniqueTags.map((tag: any) => (
                      <MenuItem key={tag} value={tag}>
                        {tag}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth style={{ marginBottom: '12px' }}>
                  <InputLabel>Mail</InputLabel>
                  <Select value={template} onChange={handleChange}>
                    <MenuItem value="default">Default</MenuItem>
                    <MenuItem value="new">Create New</MenuItem>
                  </Select>
                </FormControl>
                {schedule && (
                  <>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DemoContainer  components={['DateTimePicker']}>
                        <DateTimePicker
                          label="Pick a Date & Time"
                          value={time}
                          onChange={(newValue) => setTime(newValue)}
                        />
                      </DemoContainer>
                    </LocalizationProvider>
                  </>
                )}
                <FormControlLabel className="mb-4 mt-4" style={{ marginBottom : '20px'}} control={<Checkbox  onChange={(e) => setSchedule(e.target.checked)} />} label="Schedule" />
                <br />
                <Button
                  className="bg-[#000]  text-white cursor-pointer flex items-center p-4 border text-lg rounded-lg"
                  onClick={handleCampaign} >Create Campaign</Button>
              </Box>
            </Modal>
            <EmailStatusChart />

            
          <div style={{
            height : '40vh',
            width : '80vw',
          }} className='mt-48 bg-black rounded-2xl mb-24'>
            <Box
              sx={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 900'%3E%3Cpolygon fill='%23000000' points='957 450 539 900 1396 900'/%3E%3Cpolygon fill='%23111111' points='957 450 872.9 900 1396 900'/%3E%3Cpolygon fill='%23191919' points='-60 900 398 662 816 900'/%3E%3Cpolygon fill='%23222222' points='337 900 816 900 886 661'/%3E%3Cpolygon fill='%232a2a2a' points='1008 101 1008 831 743 900'/%3E%3Cpolygon fill='%23333333' points='1008 101 1041.6 869.8 743 900'/%3E%3Cpolygon fill='%233b3b3b' points='1041.6 901 1782 612 1782 900'/%3E%3Cpolygon fill='%23444444' points='1782 900 1041.6 869.8 1782 612'/%3E%3Cpolygon fill='%234c4c4c' points='953 612 1782 612 1008 31'/%3E%3Cpolygon fill='%23555555' points='1008 31 1041.6 131.2 1782 612'/%3E%3Cpolygon fill='%235d5d5d' points='348 361 831 361 827 217'/%3E%3Cpolygon fill='%23666666' points='348 361 807.6 661 831 361'/%3E%3Cpolygon fill='%236e6e6e' points='348 28 348 361 827 217'/%3E%3Cpolygon fill='%23777777' points='348 361 807.6 661 516 28'/%3E%3C/svg%3E")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                padding: '2rem',
                borderRadius: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                height : '20vh',
            width : '80vw'
              }}
            >
            
            </Box>
          </div>

          </div>
          <div className="mt-24">
          <h2 className='mt-2 mb-12 text-3xl font-bold tracking-tight text-gray-900 '>
            Campaigns
          </h2>
            <div className="w-full flex justify-end items-center">
              <Button
                className="p-2 bg-black mb-12 w-fit text-white cursor-pointer flex items-center gap-1 border text-lg rounded-lg"
                onClick={handleOpen}
              >
                <AddIcon />
                Create
              </Button>
            </div>
            {sortedCampaigns && sortedCampaigns.length > 0 ? (
              <div>
                {sortedCampaigns.map((campaign: any) => {
                  const openedEmailsCount = campaign.emails.filter((email: any) => email.status === 'OPENED').length;
                  const deliveredEmailsCount = campaign.emails.filter((email: any) => email.status === 'DELIVERED').length;
                  const clickedEmailsCount = campaign.emails.filter((email: any) => email.status === 'CLICKED').length;
                  const bouncedEmailsCount = campaign.emails.filter((email: any) => email.status === 'BOUNCED').length;

                  return (
                    <div className="mb-10 p-4 border rounded-lg" key={campaign.id}>
                      <Accordion style={{ boxShadow: 'none' }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1-content" id="panel1-header">
                          <div className="max-w-full">
                            <div className="space-y-1">
                            <h1 className="text-medium font-bold text-gray text-2xl mb-4">{campaign.name}</h1>
                            <div className="flex flex-row">
                              <h1 className="font-semibold mr-4">TOTAL : </h1>
                              {campaign.Totalmail}
                              </div>
                            </div>
                            <Divider className="my-4" style={{ borderWidth: '1px', width: '70vw', marginBottom: '5vh', marginTop: '3vh' }} />
                            <div className="flex h-5 items-center space-x-4 text-small mb-4 w-full">
                              <StatDisplay label="OPENED" count={openedEmailsCount} />
                              <VerticalDivider />
                              <StatDisplay label="DELIVERED" count={deliveredEmailsCount} />
                              <VerticalDivider />
                              <StatDisplay label="CLICKED" count={clickedEmailsCount} />
                              <VerticalDivider />
                              <StatDisplay label="BOUNCED" count={bouncedEmailsCount} />
                              
                              <StatDisplay label="BOUNCED" count={bouncedEmailsCount} />
                            </div>
                          </div>
                        </AccordionSummary>
                        <AccordionDetails>
                        <h1 className="ml-6 font-bold mb-8 mt-4">ALL MAILS</h1>
                          <ul>
                            {campaign.emails.map((email: any) => (
                              <li key={email.id} className="border w-11/12 rounded-lg p-4 flex flex-row mb-4">
                                <Typography sx={{
                                  marginRight : '5vw'
                                }} className="ml-12">
                                  <strong className="mr-12">EMAIL</strong> {email.recipientEmail}
                                </Typography>
                                <Typography>
                                  <strong className="mr-12">STATUS</strong> {email.status}
                                </Typography>
                              </li>
                            ))}
                          </ul>
                        </AccordionDetails>
                      </Accordion>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Typography>No campaigns created</Typography>
            )}
          </div>
        </>
      ) : (
        <Typography>Verify your email first then reload the page</Typography>
      )}
    </div>
  );
};

const StatDisplay = ({ label, count }: { label: string; count: number }) => (
  <div style={{ marginRight: '3vw' }} className="flex flex-col justify-center text-center">
    <Typography className="mb-1 font-semibold">{label}</Typography>
    <Typography>{count}</Typography>
  </div>
);

const VerticalDivider = () => (
  <Divider style={{ borderColor: 'gray', borderWidth: '1px', height: '5vh', marginRight: '3vw' }} orientation="vertical" />
);

export default FileUploadPage;

