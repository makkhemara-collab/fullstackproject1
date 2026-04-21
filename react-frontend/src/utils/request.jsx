import axios from 'axios';
import { baseURL } from './config';


const request = (path="",method="GET" , data={}, customHeaders={}) =>{
    const isFormData = data instanceof FormData;

    return axios({
        method:method,
        url:baseURL+path,
        data :data,
        headers : isFormData
            ? { ...customHeaders }
            : {
                'Content-Type' : 'application/json',
                ...customHeaders
            }
    })
    .then((response) =>{
        return response.data;
    })
    .catch((error) =>{
        console.log(error);
        throw error;
    })
}

export default request;