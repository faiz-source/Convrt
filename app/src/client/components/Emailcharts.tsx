import React, { useEffect, useState } from 'react';
import { useQuery } from 'wasp/client/operations';
import { getCampaigns } from 'wasp/client/operations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaceIcon, ImageIcon, SunIcon } from '@radix-ui/react-icons';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

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
