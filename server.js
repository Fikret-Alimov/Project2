const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());


const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ASSISTANT_ID = process.env.ASSISTANT_ID;

app.post('/message', async (req, res) => {
    const { message, threadId } = req.body;

    try {
        let thread;
        if (!threadId) {
            // Create a new thread
            const threadResponse = await axios.post('https://api.openai.com/v1/threads', {}, {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'OpenAI-Beta': 'assistants=v2',
                    'Content-Type': 'application/json'
                }
            });
            thread = threadResponse.data.id;
        } else {
            thread = threadId;
        }

        // Add a message to the thread
        await axios.post(`https://api.openai.com/v1/threads/${thread}/messages`, {
            role: 'user',
            content: message
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'OpenAI-Beta': 'assistants=v2',
                'Content-Type': 'application/json'
            }
        });

        // Run the assistant
        const runResponse = await axios.post(`https://api.openai.com/v1/threads/${thread}/runs`, {
            assistant_id: ASSISTANT_ID
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'OpenAI-Beta': 'assistants=v2',
                'Content-Type': 'application/json'
            }
        });

        // Check the run status
        let runStatus;
        do {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const statusResponse = await axios.get(`https://api.openai.com/v1/threads/${thread}/runs/${runResponse.data.id}`, {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'OpenAI-Beta': 'assistants=v2'
                }
            });
            runStatus = statusResponse.data.status;
        } while (runStatus !== 'completed');
 // Get the assistant's response
 const messagesResponse = await axios.get(`https://api.openai.com/v1/threads/${thread}/messages`, {
    headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'assistants=v2'
    }
});

const assistantMessage = messagesResponse.data.data[0].content[0].text.value;

res.json({ response: assistantMessage, threadId: thread });
} catch (error) {
console.error('Error occurred:', error);
if (error.response) {
    console.error('Error response data:', error.response.data);
}
res.status(500).send('Something went wrong!');
}
});

app.listen(port, () => {
console.log(`Server is running on http://localhost:${port}`);
});
