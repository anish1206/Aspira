const ELEVENLABS_API_KEY = process.env.REACT_APP_ELEVENLABS_KEY || 'sk_6ca674b08615feea03e3f00f0dbae904576232b19b8733e7';

export async function speak(text) {
    if (!text) return;

    try {
        const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL", {
            method: "POST",
            headers: {
                "xi-api-key": ELEVENLABS_API_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                text: text,
                model_id: "eleven_multilingual_v2",
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`TTS Error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();
    } catch (error) {
        console.error("Error in TTS:", error);
    }
}
