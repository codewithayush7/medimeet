"use client";

import { useRouter } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Loader2, User, Video, VideoOff, Mic, MicOff, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";

function VideoCall({ sessionId, token }) {
    const [isLoading, setIsLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);

    const sessionRef = useRef(null);
    const publisherRef = useRef(null);

    const router = useRouter();

    const appId = process.env.NEXT_PUBLIC_VONAGE_APPLICATION_ID;

    if (!sessionId || !token || !appId) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h1 className="text-3xl font-bold text-white mb-4">
                    Invalid Video Call
                </h1>
                <p className="text-muted-foreground mb-6">
                    Missing required parameters for the video call.
                </p>
                <Button
                    onClick={() => router.push("/appointments")}
                    className="bg-emerald-600 hover:bg-emerald-700">
                    Back to Appointments
                </Button>
            </div>
        );
    }

    function handleScriptLoad() {
        setScriptLoaded(true);

        if (!window.OT) {
            toast.error("Failed to load Video API");
            setIsLoading(false);
            return;
        }
        initializeSession();
    }

    function initializeSession() {
        if (!appId || !sessionId || !token) {
            toast.error("Missing required video call parameters");
            router.push("/appointments");
            return;
        }

        try {
            sessionRef.current = window.OT.initSession(appId, sessionId);

            // Handle incoming streams
            sessionRef.current.on("streamCreated", (event) => {
                console.log("Stream created:", event.stream);
                
                // Check if subscriber container exists
                const subscriberContainer = document.getElementById("subscriber");
                if (!subscriberContainer) {
                    console.error("Subscriber container not found");
                    return;
                }

                sessionRef.current.subscribe(event.stream, "subscriber", {
                    insertMode: "append",
                    width: "100%",
                    height: "100%",
                },
                    (error) => {
                        if (error) {
                            console.error("Subscriber error:", error);
                            toast.error("Error connecting to other participant's stream");
                        } else {
                            console.log("Successfully subscribed to stream");
                        }
                    });
            });

            sessionRef.current.on("sessionConnected", (event) => {
                console.log("Session connected:", event);
                setIsConnected(true);
                
                // Small delay to ensure DOM is ready
                setTimeout(() => {
                    // Check if the publisher container still exists
                    const publisherContainer = document.getElementById("publisher");
                    if (!publisherContainer) {
                        console.error("Publisher container not found");
                        setIsLoading(false);
                        return;
                    }

                    // Initialize publisher after session is connected
                    publisherRef.current = window.OT.initPublisher("publisher", {
                        insertMode: "replace",
                        width: "100%",
                        height: "100%",
                        publishAudio: isAudioEnabled,
                        publishVideo: isVideoEnabled,
                        resolution: '640x480',
                        frameRate: 30
                    }, (error) => {
                        if (error) {
                            console.error("Publisher Error:", error);
                            toast.error("Error initializing your camera and microphone");
                            setIsLoading(false);
                        } else {
                            console.log("Publisher initialized successfully - you should see your video now");
                            
                            // Publish the stream after publisher is initialized
                            sessionRef.current.publish(publisherRef.current, (publishError) => {
                                if (publishError) {
                                    console.error("Error publishing stream:", publishError);
                                    toast.error("Error publishing your stream");
                                } else {
                                    console.log("Stream published successfully");
                                }
                                setIsLoading(false);
                            });
                        }
                    });
                }, 100);
            });

            sessionRef.current.on("sessionDisconnected", (event) => {
                console.log("Session disconnected:", event);
                setIsConnected(false);
            });

            sessionRef.current.on("connectionCreated", (event) => {
                console.log("Connection created:", event);
            });

            sessionRef.current.on("connectionDestroyed", (event) => {
                console.log("Connection destroyed:", event);
            });

            // Connect to the session
            sessionRef.current.connect(token, (error) => {
                if (error) {
                    console.error("Error connecting to session:", error);
                    toast.error("Error connecting to video session");
                    setIsLoading(false);
                } else {
                    console.log("Connected to session successfully");
                }
            });
        } catch (error) {
            console.error("Failed to initialize session:", error);
            toast.error("Failed to initialize video call");
            setIsLoading(false);
        }
    }

    function toggleVideo() {
        if (publisherRef.current) {
            publisherRef.current.publishVideo(!isVideoEnabled);
            setIsVideoEnabled((prev) => !prev);
        }
    }

    function toggleAudio() {
        if (publisherRef.current) {
            publisherRef.current.publishAudio(!isAudioEnabled);
            setIsAudioEnabled((prev) => !prev);
        }
    }

    function endCall() {
        try {
            if (publisherRef.current) {
                sessionRef.current?.unpublish(publisherRef.current);
                publisherRef.current.destroy();
                publisherRef.current = null;
            }

            if (sessionRef.current) {
                sessionRef.current.disconnect();
                sessionRef.current = null;
            }
        } catch (error) {
            console.error("Error during cleanup:", error);
        }

        router.push("/appointments");
    }

    useEffect(() => {
        return () => {
            try {
                if (publisherRef.current) {
                    sessionRef.current?.unpublish(publisherRef.current);
                    publisherRef.current.destroy();
                    publisherRef.current = null;
                }
                if (sessionRef.current) {
                    sessionRef.current.disconnect();
                    sessionRef.current = null;
                }
            } catch (error) {
                console.error("Error during component cleanup:", error);
            }
        }
    }, [])

    return (
        <>
            <Script
                src="https://unpkg.com/@vonage/client-sdk-video@latest/dist/js/opentok.js"
                onLoad={handleScriptLoad}
                onError={() => {
                    toast.error("Failed to load video call script");
                    setIsLoading(false);
                }}
            />

            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Video Consultation
                    </h1>
                    <p className="text-muted-foreground">
                        {isConnected
                            ? "Connected"
                            : isLoading
                                ? "Connecting..."
                                : "Connection failed"}
                    </p>
                </div>

                {isLoading && !scriptLoaded ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-12 w-12 text-emerald-400 animate-spin mb-4" />
                        <p className="text-white text-lg">
                            Loading video call components...
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="border border-emerald-900/20 rounded-lg overflow-hidden">
                                <div className="bg-emerald-900/10 px-3 py-2 text-emerald-400 text-sm font-medium">
                                    You
                                </div>
                                <div className="w-full h-[300px] md:h-[400px] bg-muted/30"
                                    id="publisher">
                                    {!isConnected && (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="bg-muted/20 rounded-full p-8">
                                                <User className="h-12 w-12 text-emerald-400" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="border border-emerald-900/20 rounded-lg overflow-hidden">
                                <div className="bg-emerald-900/10 px-3 py-2 text-emerald-400 text-sm font-medium">
                                    Other Participant
                                </div>
                                <div
                                    id="subscriber"
                                    className="w-full h-[300px] md:h-[400px] bg-muted/30">
                                    {(!isConnected || !scriptLoaded) && (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="bg-muted/20 rounded-full p-8">
                                                <User className="h-12 w-12 text-emerald-400" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center space-x-4">
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={toggleVideo}
                                className={`rounded-full p-4 h-14 w-14 ${isVideoEnabled
                                    ? "border-emerald-900/30"
                                    : "bg-red-900/20 border-red-900/30 text-red-400"
                                    }`}
                                disabled={!publisherRef.current}>
                                {isVideoEnabled ? <Video /> : <VideoOff />}
                            </Button>

                            <Button
                                variant="outline"
                                size="lg"
                                onClick={toggleAudio}
                                className={`rounded-full p-4 h-14 w-14 ${isAudioEnabled
                                    ? "border-emerald-900/30"
                                    : "bg-red-900/20 border-red-900/30 text-red-400"
                                    }`}
                                disabled={!publisherRef.current}>
                                {isAudioEnabled ? <Mic /> : <MicOff />}
                            </Button>

                            <Button
                                variant="destructive"
                                size="lg"
                                onClick={endCall}
                                className="rounded-full p-4 h-14 w-14 bg-red-600 hover:bg-red-700">
                                <PhoneOff />
                            </Button>
                        </div>
                        <div className="text-center">
                            <p className="text-muted-foreground text-sm">
                                {isVideoEnabled ? "Camera on" : "Camera off"} •
                                {isAudioEnabled ? " Microphone on" : " Microphone off"}
                            </p>
                            <p className="text-muted-foreground text-sm mt-1">
                                When you're finished with your consultation, click the red
                                button to end the call
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </>
    ) 
}

export default VideoCall