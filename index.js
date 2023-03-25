const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Configuration, OpenAIApi } = require("openai");
const bodyParser = require('body-parser');
const userService = require("./user-service.js");

/*Config */
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  /* Server */
const PORT = process.env.PORT || 3000;

//  app.listen(PORT,()=>{
//     console.log(PORT)
//  })

// userService.connect().then(()=>{
//   //  app.listen(PORT, ()=>{
//   //      console.log("App listening on: " + PORT);
//   //  });
//   console.log("Connected to database")
// }).catch((e)=>{
//   console.log(e);
// });



async function createConversation(messageHistory){

    let lastUserInput = messageHistory[messageHistory.length - 1].content;
    
    const response = await openai.createModeration({
        input: lastUserInput,
      });
    const output = response.data.results[0];
    const flagged = output.flagged;
    
    if (flagged) {
        const categories = response.data.results[0].categories;
        let maxScore = 0;
        let maxCategory = '';
      
        for (const category in categories) {
            if (categories[category] && response.data.results[0].category_scores[category] > maxScore) {
              maxScore = response.data.results[0].category_scores[category];
              maxCategory = category;
            }
          }
          
          let warningMessage = '';
          
          switch (maxCategory) {
            case 'hate':
              warningMessage = 'Warning!!! Your message has been flagged for containing hate speech. Please refrain from using such language in the future.';
              break;
            case 'hate/threatening':
              warningMessage = 'Warning!!! Your message has been flagged for containing threatening language. Please refrain from using such language in the future.';
              break;
            case 'self-harm':
              warningMessage = 'Warning!!! Your message has been flagged for containing self-harm language. Please refrain from using such language in the future.';
              break;
            case 'sexual':
              warningMessage = 'Warning!!! Your message has been flagged for containing sexual language. Please refrain from using such language in the future.';
              break;
            case 'sexual/minors':
              warningMessage = 'Warning!!! Your message has been flagged for containing sexual content involving minors. This is illegal and will not be tolerated.';
              break;
            case 'violence':
              warningMessage = 'Warning!!! Your message has been flagged for containing violent language. Please refrain from using such language in the future.';
              break;
            case 'violence/graphic':
              warningMessage = 'Warning!!! Your message has been flagged for containing graphic violence. This is not acceptable and will not be tolerated.';
              break;
            default:
              warningMessage = 'Warning!!! Your message has been flagged for inappropriate content. Please refrain from using such language in the future.';
              break;
          }
      
        return warningMessage;
      }
     
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

  app.get('/',(req,res)=>{
    res.json({message : "API listening (updated)"})
})


app.post('/api/message', async (req, res) => {
    try {
       console.log(req.body.messageHistory) 
      let messageHistory = JSON.parse(req.body.messageHistory); 
      if (!Array.isArray(messageHistory)) {
        throw new Error('messageHistory should be an array');
      }
      let answer1 = '';
      const answer = await createConversation(messageHistory); 
      res.json({aiResponse : answer}) ;
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  });
  

app.post('/api/signup', (req,res)=>{
  
    userService.registerUser(req.body).then((msg)=>{
      res.json({"msg":msg});
      }).catch((msg)=>{
      res.json({"msg":msg});
  });
});

app.post("/api/user/login", (req, res) => {
  userService.checkUser(req.body)
  .then((user) => {
      res.json({ "message": "login successful"});
  }).catch(msg => {
      res.status(422).json({ "message": msg });
  });
});



userService.connect()
.then(() => {
    app.listen(PORT, () => { console.log("API listening on: " + PORT) });
})
.catch((err) => {
    console.log("unable to start the server: " + err);
    process.exit();
});