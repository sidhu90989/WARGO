import React from 'react';

const AuthPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Driver Login</h1>
        <form>
          <input type="text" placeholder="Phone or Email" className="w-full mb-4 p-2 border rounded" />
          <input type="password" placeholder="Password" className="w-full mb-4 p-2 border rounded" />
          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">Login</button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
