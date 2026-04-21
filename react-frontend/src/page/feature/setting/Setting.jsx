import { useState } from "react";
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Notification from "./Notification";
import MethodPayment from "./MethodPayment";
import StockAlert from "./StockAlert";
import "./setting.css";

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `full-width-tab-${index}`,
        'aria-controls': `full-width-tabpanel-${index}`,
    };
}

const Setting = () => {
    const theme = useTheme();
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <div className="setting-container">
            <div className="setting-card">
                <h1 className="setting-title">General Setting</h1>
                <Box sx={{ bgcolor: 'background.paper', width: '100%' }}>
                    <AppBar position="static" color="default">
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            indicatorColor="primary"
                            textColor="primary"
                            variant="standard"
                            aria-label="settings tabs"
                        >
                            <Tab label="NOTIFICATION" {...a11yProps(0)} />
                            <Tab label="STORE INFO" {...a11yProps(1)} />
                            <Tab label="PAYMENT METHOD" {...a11yProps(2)} />
                            <Tab label="STOCK ALERT" {...a11yProps(3)} />
                        </Tabs>
                    </AppBar>
                    <TabPanel value={tabValue} index={0} dir={theme.direction}>
                        <Notification />
                    </TabPanel>
                    <TabPanel value={tabValue} index={1} dir={theme.direction}>
                        <Typography>STORE INFO content coming soon...</Typography>
                    </TabPanel>
                    <TabPanel value={tabValue} index={2} dir={theme.direction}>
                        <MethodPayment />
                    </TabPanel>
                    <TabPanel value={tabValue} index={3} dir={theme.direction}>
                        <StockAlert />
                    </TabPanel>
                </Box>
            </div>
        </div>
    );
};

export default Setting;