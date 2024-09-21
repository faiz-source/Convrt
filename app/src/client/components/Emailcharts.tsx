import React, { useEffect, useState } from 'react';
import { useQuery } from 'wasp/client/operations';
import { getCampaigns } from 'wasp/client/operations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaceIcon, ImageIcon, SunIcon } from '@radix-ui/react-icons';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { Group,  ThemeIcon,  } from '@mantine/core';
import ArrowOutwardIcon  from '@mui/icons-material/ArrowOutward';
import '../Main.css';

const EmailStatusChart = () => {
  const { data: campaigns, isLoading: isCampaignsLoading } = useQuery(getCampaigns);
  const [stats, setStats] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (campaigns) {
      let totalEmails = 0;
      let openedEmails = 0;
      let deliveredEmails = 0;
      let clickedEmails = 0;
      let bouncedEmails = 0;

      campaigns.forEach((campaign: any) => {
        totalEmails += campaign.emails.length;
        campaign.emails.forEach((email: any) => {
          if (email.opened === true) openedEmails++;
          if (email.delivered === true) deliveredEmails++;
          if (email.status === 'CLICKED') clickedEmails++;
          if (email.bounced === true) bouncedEmails++;
        });
      });

      const openRate = ((openedEmails / totalEmails) * 100).toFixed(2);
      const deliveryRate = ((deliveredEmails / totalEmails) * 100).toFixed(2);
      const bounceRate = ((bouncedEmails / totalEmails) * 100).toFixed(2);

      const newStats = [
        { title: 'Total Mails Sent', value: totalEmails, icon: <SunIcon /> },
        { title: 'Open Rate', value: `${openRate}%`, icon: <FaceIcon /> },
        { title: 'Delivery Rate', value: `${deliveryRate}%`, icon: <ImageIcon /> },
        { title: 'Bounce Rate', value: `${bounceRate}%`, icon: <SunIcon /> },
      ];
      setStats(newStats);

      const newChartData = [
        { name: 'DELIVERED', emails: deliveredEmails },
        { name: 'OPENED', emails: openedEmails },
        { name: 'CLICKED', emails: clickedEmails },
        { name: 'BOUNCED', emails: bouncedEmails },
      ];
      setChartData(newChartData);
    }
  }, [campaigns]);

  if (isCampaignsLoading) {
    return <div>Loading...</div>;
  }

  


  return (
    <Box sx={{ height: '60vh' }}>
      <Grid container   spacing={1}>
        <Grid  item xs={12} md={6}>

        <Grid  >
      <Grid container className='flex pl-4 lg:pl-0  '  spacing={2}>
        

      {stats.map((stat, index) => (
        <Grid  item xs={6} sm={6} md={6} key={index}>
         <div className='border  rounded-3xl pt-4 pb-8 px-6'>
        <Group >
          <div className="w-full relative">

          <ThemeIcon
  color="dark"
  variant="light"
  style={{
    color: 'white',
    backgroundColor: 'black',
    position : 'absolute',
    right : 0,
    width: '3rem', // Default width for larger screens
    height: '3rem', // Default height for larger screens
  }}
   className="w-12 h-12 md:w-128 md:h-128"
  radius="xl"
>
  <ArrowOutwardIcon className="text-blue" />
</ThemeIcon>

            <h1 className="text-zinc-400 mb-2 font-semibold font-Inter">
              {stat.title}
            </h1>
            <h1 className="text-black text-2xl mb-8 font-bold font-Poppins">
              {stat.value}
            </h1>
          </div>
        
        </Group>
      

<div className="w-full h-24 md:h-16">
  <svg
    className="w-full h-full"
    viewBox="0 0 2000 600"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid slice"
  >
    <path
      d="M0 600h114.286V262.217q0-4-4-4H4q-4 0-4 4ZM142.857 600h114.286V249.916q0-4-4-4H146.857q-4 0-4 4ZM285.714 600H400V408.616q0-4-4-4H289.714q-4 0-4 4ZM428.571 600h114.286V69.454q0-4-4-4H432.571q-4 0-4 4ZM571.429 600h114.285V316.61q0-4-4-4H575.43q-4 0-4 4ZM714.286 600H828.57V346.068q0-4-4-4H718.286q-4 0-4 4ZM857.143 600h114.286V441.444q0-4-4-4H861.143q-4 0-4 4ZM1000 600h114.286V437.747q0-4-4-4H1004q-4 0-4 4ZM1142.857 600h114.286V199.828q0-4-4-4h-106.286q-4 0-4 4ZM1285.714 600H1400V364.638q0-4-4-4h-106.286q-4 0-4 4ZM1428.571 600h114.286V300.933q0-4-4-4h-106.286q-4 0-4 4ZM1571.429 600h114.285V344.184q0-4-4-4H1575.43q-4 0-4 4ZM1714.286 600h114.285V201.699q0-4-4-4h-106.285q-4 0-4 4ZM1857.143 600h114.286V318.464q0-4-4-4h-106.286q-4 0-4 4Z"
      fill="#444cf7"
    />
  </svg>
</div>





        </div>
        </Grid>
      ))}


      
          </Grid>
          </Grid>


        </Grid>


        <Grid item xs={12} md={6}>
          <ResponsiveContainer width="100%" height={450}>
            <BarChart data={chartData} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="emails" fill="#000000" />
            </BarChart>
          </ResponsiveContainer>
        </Grid>


      </Grid>


    </Box>
  );
};

export default EmailStatusChart;







/*
import React, { useEffect, useState } from 'react';
import { useQuery } from 'wasp/client/operations';
import { getCampaigns } from 'wasp/client/operations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaceIcon, ImageIcon, SunIcon } from '@radix-ui/react-icons';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { Text, Progress, Card } from '@mantine/core';
import classes from '../Main.css';

const EmailStatusChart = () => {
  const { data: campaigns, isLoading: isCampaignsLoading } = useQuery(getCampaigns);
  const [stats, setStats] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (campaigns) {
      let totalEmails = 0;
      let openedEmails = 0;
      let deliveredEmails = 0;
      let clickedEmails = 0;
      let bouncedEmails = 0;

      campaigns.forEach((campaign: any) => {
        totalEmails += campaign.emails.length;
        campaign.emails.forEach((email: any) => {
          if (email.opened === true) openedEmails++;
          if (email.delivered === true) deliveredEmails++;
          if (email.status === 'CLICKED') clickedEmails++;
          if (email.bounced === true) bouncedEmails++;
        });
      });

      const openRate = ((openedEmails / totalEmails) * 100).toFixed(2);
      const deliveryRate = ((deliveredEmails / totalEmails) * 100).toFixed(2);
      const bounceRate = ((bouncedEmails / totalEmails) * 100).toFixed(2);

      const newStats = [
        { title: 'Total Mails Sent', value: totalEmails, icon: <SunIcon /> },
        { title: 'Open Rate', value: `${openRate}%`, icon: <FaceIcon /> },
        { title: 'Delivery Rate', value: `${deliveryRate}%`, icon: <ImageIcon /> },
        { title: 'Bounce Rate', value: `${bounceRate}%`, icon: <SunIcon /> },
      ];
      setStats(newStats);

      const newChartData = [
        { name: 'DELIVERED', emails: deliveredEmails },
        { name: 'OPENED', emails: openedEmails },
        { name: 'CLICKED', emails: clickedEmails },
        { name: 'BOUNCED', emails: bouncedEmails },
      ];
      setChartData(newChartData);
    }
  }, [campaigns]);

  if (isCampaignsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ height: '60vh' }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Grid container spacing={4}>


            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <div className="flex flex-col items-center p-4 h-full bg-white border border-gray-200 rounded-xl shadow-none">
                  <div className="flex items-center justify-center w-14 h-14 bg-gray-200 rounded-full mb-4">
                    {stat.icon}
                  </div>
                  <div className="text-center">
                    <h6 className="text-lg font-medium mb-2">{stat.title}</h6>
                    <h4 className="text-2xl font-bold">{stat.value}</h4>
                  </div>
                </div>
              </Grid>
            ))}

          </Grid>
        </Grid>


        <Grid item xs={12} md={6}>
          <ResponsiveContainer width="100%" height={450}>
            <BarChart data={chartData} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="emails" fill="#000000" />
            </BarChart>
          </ResponsiveContainer>
        </Grid>
      </Grid>


    </Box>
  );
};

export default EmailStatusChart;



*/



