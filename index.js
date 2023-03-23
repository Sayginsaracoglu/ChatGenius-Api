const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Configuration, OpenAIApi } = require("openai");
const bodyParser = require('body-parser')

/*Config */
dotenv.config();
const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
/* Server */
const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log(PORT)
})

async function createConversation(messageHistory){
   
    let completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: messageHistory,
    });
    if(completion.data.choices[0].message){
      //console.log(`Assistant: ${completion.data.choices[0].message.content}`);
     
      answer1 = completion.data.choices[0].message.content;
      let includes = answer1.includes("```");
      if(includes){
        while(includes){
          answer1 = answer1.replace(/```/, "<code class='highlight'>");
          answer1 = answer1.replace(/```/, "</code>");
          includes = answer1.includes("```")
        }
      }
      messageHistory.push(completion.data.choices[0].message);
    }
    return answer1;
  }

app.post('/api/message', async (req, res) => {
    
    
    try {
      let messageHistory = JSON.parse(req.body.messageHistory); 
      
      let answer1 = '';
      const answer = await createConversation(messageHistory); 
      res.json({aiResponse : answer}) ;
      
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Something went wrong!' });
    }
  });
