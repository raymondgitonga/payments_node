const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const router = express.Router();
const request = require('request')

let resultCode


router.use(bodyParser.urlencoded({extended : true}));
router.use(bodyParser.json());

// accestoken
router.get('/access_token', access, (req, res)=>{
    res.status(200).json({access_token: req.access_token})
})

// register url
router.get('/register', access, (req, res)=>{
    let url = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl"
    let auth =  "Bearer " + req.access_token

    request({
        url : url,
        method : "POST",
        headers:{
           "Authorization": auth 
        },
        json: {
          "ShortCode": "600732",
          "ResponseType": "Complete",
          "ConfirmationURL": "http://payment-env.y3jkszyd3w.eu-west-2.elasticbeanstalk.com/mobile/confirmation",
          "ValidationURL": "http://payment-env.y3jkszyd3w.eu-west-2.elasticbeanstalk.com/mobile/validation_url"
        }
    },
    function(error, response, body){
        if(error){console.log(error)}

        res.status(200).json(body)
    })
})

router.post('/stk', access, (req, res)=>{
    const phone = req.body.phone
    const amount = req.body.amount 
    const timestamp = req.body.timestamp

    let endpoint = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
    let auth = "Bearer "+ req.access_token

    
    const password = new Buffer.from('174379' + 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919' + timestamp).toString('base64')

    request({
        url: endpoint,
        method:"POST",
        headers:{
            "Authorization": auth
        },
        json:{
            "BusinessShortCode": "174379",
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": amount,
            "PartyA": phone,
            "PartyB": "174379",
            "PhoneNumber": phone,
            "CallBackURL": "http://payment-env.y3jkszyd3w.eu-west-2.elasticbeanstalk.com/mobile/stk_callback",
            "AccountReference": "Pool Test",
            "TransactionDesc": "Pool Test"
        }
    },
    function(error, response, body){
        if(error){
            console.log(error)
        }
        res.json({status:"Success"})
    })
})

router.post('/stk_callback',(req, res) =>{
    resultCode = req.body.Body.stkCallback.ResultCode
})

router.get('/result_code', (req, res)=>{

    if(resultCode == 0){
        res.send("Success")
    }else{
        res.send("Fail")
    }
})

function access(req, res, next){
    let url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    let auth = new Buffer.from("46aTjCMbVcXdox7a8tao8gsoeoRhM1rk:0aoA8ktKmGUB6RkF").toString('base64');
    request(
    {
        url:url,
        headers:{
            "Authorization": "Basic " + auth
        }
    },
    (error, response, body)=>{
        if(error){
            console.log(error)
        }else{
            req.access_token = JSON.parse(body).access_token
            next()
        }
    })
}



module.exports = router;