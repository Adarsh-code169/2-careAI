
export type AgentState = "idle" | "listening" | "thinking" | "speaking";

export interface TranscriptMessage {
    role: "user" | "assistant";
    text: string;
    isInterim?: boolean;
}

export interface WebSocketMessage {
    type: "state" | "transcript_user" | "transcript_assistant" | "barge_in" | "session_started" | "tts_audio_full" | "tts_complete" | "metrics" | "error";
    value?: AgentState;
    text?: string;
    message?: string;
    sessionId?: string;
    payload?: any;
    requestId?: number;
    isInterim?: boolean;
    turnId?: number;
    data?: {
        sttLatencyMs: number;
        llmTtftMs: number;
        llmTotalMs: number;
        ttsLatencyMs: number;
        e2eLatencyMs: number;
        bargeIn: boolean;
    };
}

export class VoiceWebSocket {
    private ws: WebSocket | null = null;
    private url: string;
    private onMessage: (msg: WebSocketMessage) => void;
    private reconnectAttempts = 0;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private closedByUser = false;
    private static readonly MAX_RECONNECT_DELAY_MS = 30000;

    constructor(url: string, onMessage: (msg: WebSocketMessage) => void) {
        this.url = url;
        this.onMessage = onMessage;
    }

    connect() {
        this.closedByUser = false;
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
            console.log("[WS] Connected to voice server");
            this.reconnectAttempts = 0;
        };

        this.ws.onmessage = (event) => {
            try {
                // Ignore binary messages for parsing (they are for audio incoming if we used binary,
                // but here backend sends base64 JSON for TTS)
                if (typeof event.data !== 'string') return;

                const msg: WebSocketMessage = JSON.parse(event.data);
                this.onMessage(msg);
            } catch (err) {
                console.error("[WS] Failed to parse message:", err);
            }
        };

        this.ws.onclose = () => {
            if (this.closedByUser) return;
            // Exponential backoff, capped, so a downed server isn't hammered.
            const delay = Math.min(
                1000 * 2 ** this.reconnectAttempts,
                VoiceWebSocket.MAX_RECONNECT_DELAY_MS
            );
            this.reconnectAttempts++;
            console.log(`[WS] Disconnected. Reconnecting in ${Math.round(delay / 1000)}s (attempt ${this.reconnectAttempts})...`);
            this.reconnectTimer = setTimeout(() => this.connect(), delay);
        };

        this.ws.onerror = (err) => {
            console.error("[WS] Error:", err);
        };
    }

    sendRaw(data: ArrayBuffer) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(data);
        }
    }

    send(data: any) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }

    close() {
        this.closedByUser = true;
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.ws) {
            this.ws.close();
        }
    }
}
