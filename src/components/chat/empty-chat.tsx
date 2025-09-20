export default function EmptyChat() {
    return (
        <div className="flex-1 overflow-y-auto w-full p-12 min-h-0 flex items-center justify-center relative">
            {/* Editorial grid background */}
            <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(90deg,#000_1px,transparent_1px),linear-gradient(0deg,#000_1px,transparent_1px)] bg-[size:60px_60px]"></div>

            <div className="text-center max-w-2xl relative z-10">
                {/* Magazine-style hero */}
                <div className="mb-12">
                    <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-primary  to-secondary rounded-3xl shadow-2xl shadow-blue-500/20 flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-700">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-inner">
                            <span className="text-blue-600 font-bold text-2xl">
                                💬
                            </span>
                        </div>
                    </div>

                    {/* Editorial typography */}
                    <div className="space-y-6">
                        <div className="border-l-4 border-primary pl-6">
                            <h1 className="text-4xl font-bold mb-2 tracking-tight">
                                Begin the Dialogue
                            </h1>
                            <div className="w-24 h-1 bg-gradient-to-br from-primary  to-secondary mb-4"></div>
                            <p className="text-xl leading-relaxed font-light">
                                Every meaningful conversation starts with a
                                single message. Share your thoughts and spark
                                engaging discussions.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                            <div className="text-center p-6  rounded-2xl border ">
                                <div className="w-12 h-12 bg-primary  rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-blue-600 text-xl">
                                        ✨
                                    </span>
                                </div>
                                <h3 className="font-semibold  mb-2">
                                    Start Fresh
                                </h3>
                                <p className="text-sm ">
                                    Begin a new conversation
                                </p>
                            </div>
                            <div className="text-center p-6  backdrop-blur-sm rounded-2xl border">
                                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-purple-600 text-xl">
                                        🚀
                                    </span>
                                </div>
                                <h3 className="font-semibold  mb-2">
                                    Share Ideas
                                </h3>
                                <p className="text-sm ">
                                    Express your thoughts
                                </p>
                            </div>
                            <div className="text-center p-6 backdrop-blur-sm rounded-2xl border">
                                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-green-600 text-xl">
                                        🌟
                                    </span>
                                </div>
                                <h3 className="font-semibold  mb-2">Connect</h3>
                                <p className="text-sm ">Build relationships</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
