Recently, I worked on an interesting feature: making a browser speak the text from a text box or a `div`. While exploring, I discovered the [speechSynthesis](https://developer.mozilla.org/en-US/docs/Web/API/Window/speechSynthesis) property of the `window` object. In this blog, I’ll walk you through how to use it to create a simple text-to-speech (TTS) implementation.

## Step 1: Create a SpeechSynthesis Object
To begin, we need to create a `SpeechSynthesis` object. This is the entry point for the Web Speech API's text-to-speech functionality.
```js
const speechSynth = window.speechSynthesis
```
-------------
## Step 2: Prepare the Text to Speak
Define the text you want the browser to speak. For example:
```js
const textToSpeak = "hello world"
```
-------------
## Step 3: Create a SpeechSynthesisUtterance Object
Next, we need a `SpeechSynthesisUtterance` object to encapsulate the text. This object represents the speech request.
```js
const utterThis = new SpeechSynthesisUtterance(textToSpeak)
```
-------------
## Step 4: Choose a Voice (Optional)
The Web Speech API supports multiple voices. You can retrieve the available voices using the `getVoices()` method:
```js
speechSynth.getVoices()
```

You can select a specific voice if desired. For example, to choose a voice named "Andy":
```js
const selectedVoice = voices.find(v => v.name.includes("Andy"))
utterThis.voice = selectedVoice
```
If no voice is specified, the browser will use the default voice.

-------------
## Step 5: Speak the Text
Now, it’s time to make the browser speak the text:
```js
speechSynth.speak(utterThis)
```
You should hear the browser say, "hello world."

-------------

## Additional features
### Cancelling speech

If you need to stop the speech midway, you can call the `cancel()` method:
```js
speechSynth.cancel();
```

### End event
The `SpeechSynthesisUtterance` object supports various events, such as `end`, which is triggered when the speech finishes. This can be useful for actions like DOM updates. For example, changing an icon after the speech ends:
```js
utterThis.addEventListener("end", {
  console.log("speech ended");
})
```

## Conclusion
This was a short blog that demonstrated how to use the `SpeechSynthesis` property of the `window` object to create a simple text-to-speech feature in the browser. With just a few lines of JavaScript, you can implement TTS functionality and enhance the interactivity of your web applications. Explore the available voices and events to customize the experience further!
