import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send } from 'lucide-react';

function FlowAi({ problem }) {
    const [messages, setMessages] = useState([
        { 
            role: 'model', 
            parts: [{ text: "Hello! I'm your AI coding assistant. I can help you with this problem and answer any coding questions you have." }]
        }
    ]);

    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const onSubmit = async (data) => {
        if (!data.message.trim()) return;
        
        // Add user message immediately
        const userMessage = { role: 'user', parts: [{ text: data.message }] };
        setMessages(prev => [...prev, userMessage]);
        reset();
        setIsLoading(true);

        try {
            // Prepare all messages including the new one
            const allMessages = [...messages, userMessage];
            
            const response = await axiosClient.post("/flowai/generate", {
                messages: allMessages,
                title: problem?.title || "",
                description: problem?.description || "",
                testCases: problem?.visibleTestCases || [],
                startCode: problem?.startCode || ""
            });

            // Add AI response
            setMessages(prev => [...prev, { 
                role: 'model', 
                parts: [{ text: response.data.message }] 
            }]);
        } catch (error) {
            console.error("API Error:", error);
            setMessages(prev => [...prev, { 
                role: 'model', 
                parts: [{ text: "Sorry, I encountered an error. Please try again." }]
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen max-h-[80vh] min-h-[500px] border rounded-lg">
            {/* Header */}
            <div className="p-4 border-b bg-base-200">
                <h3 className="font-semibold">AI Coding Assistant</h3>
                {problem?.title && (
                    <p className="text-sm text-gray-600 truncate">Problem: {problem.title}</p>
                )}
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div 
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                msg.role === "user" 
                                    ? "bg-primary text-primary-content" 
                                    : "bg-base-200 text-base-content border"
                            }`}
                        >
                            <div className="whitespace-pre-wrap">{msg.parts[0].text}</div>
                        </div>
                    </div>
                ))}
                
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-base-200 text-base-content border rounded-lg px-4 py-2">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form 
                onSubmit={handleSubmit(onSubmit)} 
                className="sticky bottom-0 p-4 bg-base-100 border-t"
            >
                <div className="flex items-center">
                    <input 
                        placeholder="Ask about the problem or coding concepts..." 
                        className="input input-bordered flex-1 w-full" 
                        disabled={isLoading}
                        {...register("message", { 
                            required: "Message is required", 
                            minlength: { value: 2, message: "Message is too short" }
                        })}
                    />
                    <button 
                        type="submit" 
                        className="btn btn-primary ml-2"
                        disabled={isLoading || errors.message}
                    >
                        <Send size={20} />
                    </button>
                </div>
                {errors.message && (
                    <p className="text-error text-sm mt-1">{errors.message.message}</p>
                )}
            </form>
        </div>
    );
}

export default FlowAi;