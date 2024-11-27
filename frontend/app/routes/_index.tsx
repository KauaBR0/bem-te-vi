import type { MetaFunction } from "@remix-run/node";
import { useEffect } from 'react';
import { useNavigate } from '@remix-run/react';
import { isAuthenticated } from '~/utils/auth';

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/todos');
    } else {
      navigate('/auth/login');
    }
  }, []);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="spinner animate-spin">🔄</div>
        <p className="mt-4 text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
