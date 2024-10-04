import React, { useState } from 'react';
import { Modal, Box, TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { Button as NextUIButton } from '@nextui-org/react';
import { useLocationSearch, useBusinessSearch } from './useLocationSearch';
import { createTask } from 'wasp/client/operations'; // Import the createTask function to insert data into the database

interface AddTaskModalProps {
  isOpen: boolean;
  handleClose: () => void;
  isLoading: boolean;
  style: any;
  setIsLoading: (loading: boolean) => void;
}

interface LocationOption {
  label: string;
  lat: string;
  lon: string;
}

const ScrapeModal: React.FC<AddTaskModalProps> = ({ isOpen, handleClose, isLoading, style, setIsLoading }) => {
  const [inputValue, setInputValue] = useState(''); // For TextField value
  const [autocompleteInput, setAutocompleteInput] = useState(''); // For Autocomplete input
  const [selectedLocation, setSelectedLocation] = useState<{ lat: string; lon: string } | null>(null);

  // Hook for location autocomplete
  const { locationOptions, debouncedFetch, error: locationError } = useLocationSearch();
  // Hook for fetching business data
  const { fetchBusiness } = useBusinessSearch();

  // Handle input change for the Autocomplete
  const handleAutocompleteInputChange = (event: any, newInputValue: string) => {
    setAutocompleteInput(newInputValue); // Update Autocomplete input value
    debouncedFetch(newInputValue); // Trigger the debounced fetch
  };

  // Handle selecting an option from the Autocomplete
  const handleOptionSelect = (event: any, option: LocationOption | null) => {
    if (option) {
      setSelectedLocation({ lat: option.lat, lon: option.lon });
    }
  };

  // Handle TextField input change
  const handleTextFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  // Function to handle scraping and adding the data to the database
  const handleGetPlaces = async () => {
    if (!selectedLocation) {
      console.warn('Location not selected');
      return;
    }

    setIsLoading(true);

    try {
      // Fetch business data using lat and lon of the selected location
      const data = await fetchBusiness(inputValue, selectedLocation.lat, selectedLocation.lon);

      if (!data || !Array.isArray(data)) {
        console.error('Invalid business data');
        return;
      }

      // Loop through the fetched business data and insert valid records into the database
      for (const business of data) {
        const { name, phone_number, website, address, emails_and_contacts } = business;

        // Check if the required fields are available
        if (!name || !phone_number || !website || !address) {
          console.log('Skipping row: Required fields missing');
          continue;
        }

        const emailValue = emails_and_contacts?.emails?.[0] || 'No email available'; // Safely get the email

        // Prepare the task data
        const taskData = {
          description: website || 'No description provided', // Use website as description
          name, // Business name
          email: emailValue, // First available email
          Tag: inputValue, // Input search term used as a tag
          Location: address, // Business address
          Number: phone_number, // Phone number
        };

        try {
          // Insert the task into the database using createTask
          await createTask(taskData);
        } catch (error) {
          console.error('Error inserting task:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching business data:', error);
    } finally {
      setIsLoading(false); // Stop loading spinner
    }
  };

  return (
    <Modal open={isOpen} onClose={handleClose}>
      <Box sx={style}>
        <h1 className="font-Poppins text-center">Scrape Maps Data</h1>

        <div className="w-full flex-col">
          <div className="flex flex-col space-y-6 space-x-2 md:flex-row mb-8 md:mb-4">
            <Autocomplete
              inputValue={autocompleteInput} // Control the input value of Autocomplete separately
              options={locationOptions}
              getOptionLabel={(option) => option.label || ''}
              onInputChange={handleAutocompleteInputChange} // Handle autocomplete input
              onChange={handleOptionSelect} // Handle option selection
              sx={{
                width: {
                  xs: 'auto',
                  sm: 300,
                },
                marginLeft: '2vw',
                marginTop: {
                  xs: '4vh',
                  sm: '4vh',
                },
              }}
              renderInput={(params) => <TextField {...params} label="Search Location" />}
            />

            <TextField
              sx={{
                width: {
                  sm: 'auto',
                  md: 300,
                },
              }}
              value={inputValue} // TextField has its own value
              onChange={handleTextFieldChange} // Handle TextField input separately
              label="Location"
            />
          </div>

          <div className="w-full flex justify-center md:justify-end">
            <NextUIButton
              className="bg-[#000] w-48 md:w-48 text-white cursor-pointer flex items-center gap-1 border text-lg rounded-lg"
              onClick={handleGetPlaces}
              disabled={isLoading}
            >
              {isLoading ? 'Scraping...' : 'Scrape'}
            </NextUIButton>
          </div>
        </div>
      </Box>
    </Modal>
  );
};

export default ScrapeModal;


//       {locationError && <p style={{ color: 'red' }}>{locationError}</p>}
// {businessError && <p style={{ color: 'red' }}>{businessError}</p>}
//



// import React, { useCallback, useState } from 'react';
// import {  createTask,  } from 'wasp/client/operations';
// import { Button as NextUIButton } from '@nextui-org/react';
// import Box from '@mui/material/Box';
// import Modal from '@mui/material/Modal';
// import TextField from '@mui/material/TextField';
// import Autocomplete from '@mui/material/Autocomplete';
// import debounce from 'lodash/debounce';
// import axios from 'axios'


// interface AddTaskModalProps {
//     isOpen: any;
//     handleClose : any
//     isLoading : boolean
//     style : any
//     setIsLoading : any
//   }

//   interface LocationOption {
//     label: string;
//     lat: string;
//     lon: string;
//   }

// const ScrapeModal : React.FC<AddTaskModalProps> = ({  isOpen, handleClose, isLoading, style, setIsLoading } ) => {

//     const [options, setOptions] = useState<LocationOption[]>([]); // State to store API suggestions
//     const [inputValue, setInputValue] = useState('');  // Store input value
//     const [selectedLatLon, setSelectedLatLon] = useState<{ lat: string, lon: string } | null>(null);  // Store selected lat/lon
   


//         // AUTO COMPLETE FETCH REQUEST

//        // Function to fetch autocomplete data based on user input
//   const fetchAutocompleteData = async (value: string) => {
//     const encodedUrl = encodeURIComponent(value);
//     const autourl = `https://us1.locationiq.com/v1/search?key=pk.a3de4846111cde5ca3398d088d74f1a3&q=${encodedUrl}&format=json`;

//     if (value.length === 0) return;

//     try {
//       const { data } = await axios.get(autourl);
//       const suggestions = data.map((item: any) => ({
//         label: item.display_name,  // Display name of the location
//         lat: item.lat,             // Latitude
//         lon: item.lon,             // Longitude
//       }));
//       setOptions(suggestions);  // Update options with fetched data
//     } catch (e) {
//       console.error('Autocomplete fetch error:', e);
//       setOptions([]); // Reset options on error
//     }
//   };

//   // Debounced input handler to avoid excessive API calls
//   const debouncedHandleInputChange = useCallback(
//     debounce((value: string) => {
//       fetchAutocompleteData(value);
//     }, 500), // 500ms debounce delay
//     []
//   );

//   // Function to handle selection of an option
//   const handleOptionSelect = (event: any, selectedOption: LocationOption | null) => {
//     if (selectedOption) {
//       setSelectedLatLon({ lat: selectedOption.lat, lon: selectedOption.lon });
//     }
//   };


//   const  handleQuery = (e : any) => {
//     setInputValue(e.target.value)
//   }


//   const GetPlaces = async () => {
//     const options = {
//       method: 'GET',
//       url: `https://local-business-data.p.rapidapi.com/search-in-area`,
//       params: {
//         query: inputValue, // Use dynamic query input
//         lat: selectedLatLon?.lat,
//         lng: selectedLatLon?.lon,
//         zoom: 13,
//         limit: 2,
//         language: 'en',
//         region: 'us',
//         extract_emails_and_contacts: true,
//       },
//       headers: {
//         'x-rapidapi-key': 'b1853cbb3fmsh4fa5768495c2edep15d8aejsn2ef3358227e0',
//         'x-rapidapi-host': 'local-business-data.p.rapidapi.com',
//       },
//     };
  
//     try {
//       const response = await axios.request(options);
      
//       // Log the entire response for debugging purposes
//       console.log('Response data:', response.data);
  
//       const data = response.data.data; // Access the 'data' array in the response
  
//       if (!Array.isArray(data)) {
//         console.error('Data is not an array:', data);
//         return; // Exit if data is not iterable
//       }
  
//       for (const row of data) {
//         const { name, phone_number, website, address, emails_and_contacts } = row;
  
//         // Check if required fields are available
//         if (!name || !phone_number || !website || !address) {
//           console.log('Skipping row: Required fields missing');
//           continue;
//         }
  
//         // Handle email safely - check if emails exist and are an array
//         const emailValue = emails_and_contacts?.emails?.[0] || 'No email available';
  
//         // Set default values for other fields
//         const descriptionValue = website || 'No description provided';
//         const tagValue = inputValue; // Input search term used as a tag
//         const locationValue = address;
//         const numberValue = phone_number;
  
//         try {
//           // Await the task creation function
//           await createTask({
//             description: descriptionValue,
//             name,
//             email: emailValue,
//             Tag: tagValue,
//             Location: locationValue,
//             Number: numberValue,
//           });
//         } catch (error) {
//           console.error('Error processing row:', error);
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching data:', error);
//     }
//   };
  

  




//   return (
//     <Modal open={isOpen} onClose={handleClose}>
//     <Box sx={style}>
//       <h1 className='font-Poppins text-center' > Scrape Maps data</h1>
//       <div className='w-full flex-col '>
        
//         <div className='flex flex-col space-y-6  space-x-2 md:flex-row mb-8 md:mb-4'>
      
//         <>
// <Autocomplete
// disablePortal
// options={options}  // Use dynamic options from state
// getOptionLabel={(option) => option.label || ''} // What to display as suggestion text
// sx={{ 
//   width: {
//     xs: 'auto',
//     sm: 300,
//   },
//   marginLeft: '2vw',
//   marginTop: {
//     xs: '4vh',
//     sm: '4vh',
//   },
// }}
// onInputChange={(event, newInputValue) => {
//   setInputValue(newInputValue);  // Update input value
//   debouncedHandleInputChange(newInputValue);  // Trigger API call
// }}
// onChange={handleOptionSelect} // Handle when an option is selected
// renderInput={(params) => <TextField {...params} label="Search Location" />} // Changed label to "Search Location"
// />

// </>

// <TextField 
// onChange={handleQuery}
// sx={{ 
//   width: {
//     sm : 'auto',  
//     md: 300,  
//   },
//  }}
//  className='self-center'
//  id="outlined-basic" label="Outlined" variant="outlined" />


// </div>

// <div className='w-full flex justify-center md:justify-end'>
// <NextUIButton onClick={GetPlaces} type='submit' className='bg-[#000]  w-48 md:w-48 text-white cursor-pointer flex items-center gap-1 border text-lg rounded-lg' disabled={isLoading}>
//             {isLoading ? 'Scraping...' : 'Scrape'}
//           </NextUIButton>
// </div>

//       </div>
//     </Box>
//   </Modal>
//   );
// };

// export default ScrapeModal;
