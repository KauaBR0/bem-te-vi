import { useState, useRef } from 'react';
import { Form, useNavigate } from '@remix-run/react';
import { authApi } from '~/utils/api';
import { setToken } from '~/utils/auth';
import { useTextField } from '@react-aria/textfield';
import { useButton } from '@react-aria/button';

export default function LoginRoute() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const submitButtonRef = useRef(null);

  const { inputProps: emailInputProps } = useTextField({
    label: 'Email',
    value: email,
    onChange: setEmail,
    type: 'email',
    isRequired: true
  }, emailInputRef);

  const { inputProps: passwordInputProps } = useTextField({
    label: 'Password',
    value: password,
    onChange: setPassword,
    type: 'password',
    isRequired: true
  }, passwordInputRef);

  const { buttonProps: submitButtonProps } = useButton({
    onPress: handleSubmit
  }, submitButtonRef);

  async function handleSubmit() {
    try {
      const response = await authApi.login(email, password);
      setToken(response.token);
      navigate('/todos');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}
        <Form method="post" onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}>
          <div className="mb-4">
            <label 
              htmlFor="email" 
              className="block text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              ref={emailInputRef}
              {...emailInputProps}
              id="email"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 text-gray-800 bg-white"
            />
          </div>
          <div className="mb-6">
            <label 
              htmlFor="password" 
              className="block text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              ref={passwordInputRef}
              {...passwordInputProps}
              id="password"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 text-gray-800 bg-white"
            />
          </div>
          <button
            ref={submitButtonRef}
            {...submitButtonProps}
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-300"
          >
            Login
          </button>
        </Form>
        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <a href="/auth/register" className="text-blue-500 hover:underline">
              Register
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
