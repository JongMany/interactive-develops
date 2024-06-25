import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LoadingPage() {
  const navigate = useNavigate();
  useEffect(() => {
    setTimeout(() => {
      navigate("/main");
    }, 500);
  }, []);
  return <div>로딩</div>;
}
