const Alexa = require('ask-sdk-core');
const { 
    CONTENT_LIBRARY, 
    DEFAULT_CONTENT, 
    getContentListForSpeech,
    getContent,
    hasContent,
    getDefaultContent,
} = require('./content-library');

/* ---------- Launch & Play Handlers ---------- */

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        if (!hasContent()) {
            return handlerInput.responseBuilder
                .speak('Welcome to Home Stream. No content is configured yet. Please set up stream URLs in the skill configuration.')
                .getResponse();
        }
        const contentList = getContentListForSpeech();
        const speakOutput = `Welcome to Home Stream. You can play ${contentList}. What would you like to hear?`;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(`Try saying play ${DEFAULT_CONTENT}.`)
            .getResponse();
    }
};

const PlayDefaultIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'PlayDefaultIntent';
    },
    handle(handlerInput) {
        const content = getDefaultContent();
        if (!content) {
            return handlerInput.responseBuilder
                .speak('No content is configured. Please set up stream URLs.')
                .getResponse();
        }
        return handlerInput.responseBuilder
            .speak(`Playing ${content.title}.`)
            .addAudioPlayerPlayDirective('REPLACE_ALL', content.url, DEFAULT_CONTENT, 0, null)
            .getResponse();
    }
};

const PlayContentIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'PlayContentIntent';
    },
    handle(handlerInput) {
        // Get slot value (AMAZON.SearchQuery returns raw text)
        const slots = handlerInput.requestEnvelope.request.intent.slots;
        const contentTypeSlot = slots && slots.contentType;
        const requestedType = contentTypeSlot && contentTypeSlot.value 
            ? contentTypeSlot.value.toLowerCase().trim() 
            : null;

        if (!requestedType) {
            // Fallback to default if somehow no slot
            const content = getDefaultContent();
            if (!content) {
                return handlerInput.responseBuilder
                    .speak('No content is configured.')
                    .getResponse();
            }
            return handlerInput.responseBuilder
                .speak(`Playing ${content.title}.`)
                .addAudioPlayerPlayDirective('REPLACE_ALL', content.url, DEFAULT_CONTENT, 0, null)
                .getResponse();
        }

        // Try to find matching content
        const content = getContent(requestedType);

        if (content) {
            return handlerInput.responseBuilder
                .speak(`Playing ${content.title}.`)
                .addAudioPlayerPlayDirective('REPLACE_ALL', content.url, requestedType, 0, null)
                .getResponse();
        } else {
            // Content not found - prompt with options
            const contentList = getContentListForSpeech();
            return handlerInput.responseBuilder
                .speak(`I don't have ${requestedType}. You can play ${contentList}. What would you like?`)
                .reprompt(`Try saying play, followed by the content name.`)
                .getResponse();
        }
    }
};

/* ---------- Playback Control Handlers ---------- */

const PauseIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.PauseIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent');
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .addAudioPlayerStopDirective()
            .getResponse();
    }
};

const ResumeIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.ResumeIntent';
    },
    handle(handlerInput) {
        // For proper resume, you'd store the offset and token from PlaybackStopped
        // This is simplified to restart default content from beginning
        const content = getDefaultContent();
        if (!content) {
            return handlerInput.responseBuilder
                .speak('No content is configured.')
                .getResponse();
        }
        return handlerInput.responseBuilder
            .addAudioPlayerPlayDirective('REPLACE_ALL', content.url, DEFAULT_CONTENT, 0, null)
            .getResponse();
    }
};

/* ---------- AudioPlayer Event Handlers ---------- */

const AudioPlayerEventHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type.startsWith('AudioPlayer.');
    },
    handle(handlerInput) {
        const audioPlayerEventName = handlerInput.requestEnvelope.request.type;
        console.log(`AudioPlayer event: ${audioPlayerEventName}`);
        
        switch (audioPlayerEventName) {
            case 'AudioPlayer.PlaybackStarted':
                // Track playback started
                break;
            case 'AudioPlayer.PlaybackFinished':
                // Track playback finished
                break;
            case 'AudioPlayer.PlaybackStopped':
                // Store offset for resume: handlerInput.requestEnvelope.request.offsetInMilliseconds
                break;
            case 'AudioPlayer.PlaybackNearlyFinished':
                // Queue next track here if needed
                break;
            case 'AudioPlayer.PlaybackFailed':
                console.log('Playback failed:', handlerInput.requestEnvelope.request.error);
                break;
        }
        
        return handlerInput.responseBuilder.getResponse();
    }
};

/* ---------- PlaybackController Handlers (for physical buttons) ---------- */

const PlaybackControllerHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type.startsWith('PlaybackController.');
    },
    handle(handlerInput) {
        const controllerEventName = handlerInput.requestEnvelope.request.type;
        console.log(`PlaybackController event: ${controllerEventName}`);
        
        const content = getDefaultContent();
        switch (controllerEventName) {
            case 'PlaybackController.PlayCommandIssued':
                if (!content) {
                    return handlerInput.responseBuilder.getResponse();
                }
                return handlerInput.responseBuilder
                    .addAudioPlayerPlayDirective('REPLACE_ALL', content.url, DEFAULT_CONTENT, 0, null)
                    .getResponse();
            case 'PlaybackController.PauseCommandIssued':
                return handlerInput.responseBuilder
                    .addAudioPlayerStopDirective()
                    .getResponse();
            case 'PlaybackController.NextCommandIssued':
            case 'PlaybackController.PreviousCommandIssued':
                // Handle next/previous if you have a playlist
                break;
        }
        
        return handlerInput.responseBuilder.getResponse();
    }
};

/* ---------- System Event Handlers ---------- */

const SystemExceptionHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'System.ExceptionEncountered';
    },
    handle(handlerInput) {
        console.log('System exception:', JSON.stringify(handlerInput.requestEnvelope.request));
        return handlerInput.responseBuilder.getResponse();
    }
};

/* ---------- Standard Handlers ---------- */

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const contentList = getContentListForSpeech();
        const speakOutput = `You can say play followed by a content type. Available options are: ${contentList}. You can also say pause to stop, or resume to continue. While playing, you can say Alexa, set a sleep timer, to automatically stop playback. What would you like to play?`;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(`Try saying play ${DEFAULT_CONTENT}.`)
            .getResponse();
    }
};

const UnsupportedIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NextIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.PreviousIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.ShuffleOnIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.ShuffleOffIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.LoopOnIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.LoopOffIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.RepeatIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StartOverIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t support that feature yet.';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        return handlerInput.responseBuilder.getResponse();
    }
};

const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I didn\'t understand that. Say play to start streaming.';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);
        console.log(`Error stack: ${error.stack}`);
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/* ---------- Skill Builder ---------- */

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        PlayDefaultIntentHandler,
        PlayContentIntentHandler,
        PauseIntentHandler,
        ResumeIntentHandler,
        AudioPlayerEventHandler,
        PlaybackControllerHandler,
        SystemExceptionHandler,
        HelpIntentHandler,
        UnsupportedIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();

