import React from 'react';

const App = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-10 max-w-lg w-full text-center border border-indigo-100">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-400 text-white text-3xl shadow-md animate-bounce">
            🚧
          </div>
        </div>
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
          Mobile Display Website
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          This section is currently under construction. <br />
          We're working hard to bring it live very soon.
        </p>
        <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="absolute top-0 left-0 h-full bg-indigo-500 w-2/3 animate-pulse"></div>
        </div>
        <p className="text-sm text-gray-500 mt-3">Expected launch: Coming Soon 🚀</p>
      </div>
    </div>
  );
};

export default App;
