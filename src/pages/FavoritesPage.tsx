// FavoritesPage 重定向到 WrongBookPage 的收藏 Tab
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function FavoritesPage() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/wrong', { replace: true });
  }, [navigate]);
  return null;
}
