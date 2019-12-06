// If the includeApiResults parameter is set to true, as shown below, the full response
// from the LUIS api will be made available in the properties  of the RecognizerResult

const { ActivityHandler } = require('botbuilder');
const { LuisRecognizer, QnAMaker} = require('botbuilder-ai');

class DispatchBot extends ActivityHandler {
    constructor() {        
        super();

        const dispatchRecognizer = new LuisRecognizer({
            applicationId: process.env.LuisAppId,
            endpointKey: process.env.LuisAPIKey,
            endpoint: `https://${ process.env.LuisAPIHostName }.api.cognitive.microsoft.com`
        }, {
            includeAllIntents: true,
            includeInstanceData: true
        }, true);
        
        this.qnaMaker = new QnAMaker({
            knowledgeBaseId: process.env.QnAKnowledgebaseId,
            endpointKey: process.env.QnAEndpointKey,
            host: process.env.QnAEndpointHostName
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity('Hello! My Name is Jorbot - How can I help you today?');
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onMessage(async (context, next) => {
            console.log('Processing Message Activity.');
        
            // First, we use the dispatch model to determine which cognitive service (LUIS or QnA) to use.
            const recognizerResult = await dispatchRecognizer.recognize(context);
        
            // Top intent tell us which cognitive service to use.
            const intent = LuisRecognizer.topIntent(recognizerResult);
        
            // Next, we call the dispatcher with the top intent.
            await this.dispatchToTopIntentAsync(context, intent, recognizerResult);
        
            await next();
        });
    }

    async dispatchToTopIntentAsync(context, intent, recognizerResult) {
        switch (intent) {
        case 'rbaLUIS':
            await this.processLuis(context, recognizerResult.luisResult);
            break;
        case 'rbaQnA':
            await this.processSampleQnA(context);
            break;
        default:
            console.log(`Dispatch unrecognized intent: ${ intent }.`);
            await context.sendActivity(`Dispatch unrecognized intent: ${ intent }.`);
            break;
        }
    }

    async processSampleQnA(context) {
        const qnaResults = await this.qnaMaker.getAnswers(context);

		// If an answer was received from QnA Maker, send the answer back to the user.
		if (qnaResults[0]) {
			await context.sendActivity(`${ qnaResults[0].answer}`);
		}
		else {
			// If no answers were returned from QnA Maker, reply with help.
			await context.sendActivity(`I'm sorry. I didn't quite understand that.`
				+ ` Please try again.`);
        }
    }

    async processLuis(context, luisResult) {

    }
}

module.exports.DispatchBot = DispatchBot;