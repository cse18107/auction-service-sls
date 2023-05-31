const AWS = require('aws-sdk');

const ses = new AWS.SES({ region: "ap-south-1" });

exports.handler = async (event, context) => {
    const record = event.Records[0];
    console.log('record processing', record);

    const email = JSON.parse(record.body);
    const { subject, body, recipient } = email;

    const params = {
        Source: 'cse18107@cemk.ac.in',
        Destination: {
            ToAddresses: [recipient],
        },
        Message: {
            Body: {
                Text: {
                    Data: body
                },
            },
            Subject: {
                Data: subject
            },
        }
    };

    try{
        const result = await ses.sendEmail(params).promise();
        console.log('result------->', result);
        return result;
    } catch(error) {
        console.error(error);
    }

};