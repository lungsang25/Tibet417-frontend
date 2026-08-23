import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {

  const { t } = useTranslation('account')
  const [currentState, setCurrentState] = useState('Login');
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext)

  const [name,setName] = useState('')
  const [password,setPasword] = useState('')
  const [email,setEmail] = useState('')

  const onSubmitHandler = async (event) => {
      event.preventDefault();
      try {
        if (currentState === 'Sign Up') {
          
          const response = await axios.post(backendUrl + '/api/user/register',{name,email,password})
          if (response.data.success) {
            setToken(response.data.token)
            localStorage.setItem('token',response.data.token)
          } else {
            toast.error(response.data.message)
          }

        } else {

          const response = await axios.post(backendUrl + '/api/user/login', {email,password})
          if (response.data.success) {
            setToken(response.data.token)
            localStorage.setItem('token',response.data.token)
          } else {
            toast.error(response.data.message)
          }

        }


      } catch (error) {
        console.log(error)
        toast.error(error.message)
      }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post(backendUrl + '/api/user/google', {
        credential: credentialResponse.credential
      });
      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handleGoogleError = () => {
    toast.error(t('login.googleSignInFailed'));
  };

  useEffect(()=>{
    if (token) {
      navigate('/')
    }
  },[token])

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-ink'>
        <div className='inline-flex items-center gap-2 mb-2 mt-10'>
            <p className='prata-regular text-3xl'>{currentState === 'Login' ? t('login.loginHeading') : t('login.signUpHeading')}</p>
            <hr className='border-none h-[1.5px] w-8 bg-ink' />
        </div>
        {currentState === 'Login' ? '' : <input onChange={(e)=>setName(e.target.value)} value={name} type="text" className='w-full px-3 py-2 border border-ink' placeholder={t('login.namePlaceholder')} required/>}
        <input onChange={(e)=>setEmail(e.target.value)} value={email} type="email" className='w-full px-3 py-2 border border-ink' placeholder={t('login.emailPlaceholder')} required/>
        <input onChange={(e)=>setPasword(e.target.value)} value={password} type="password" className='w-full px-3 py-2 border border-ink' placeholder={t('login.passwordPlaceholder')} required/>
        <div className='w-full flex justify-end text-sm mt-[-8px]'>
            {
              currentState === 'Login'
              ? <button type='button' onClick={()=>setCurrentState('Sign Up')} className='cursor-pointer bg-transparent border-0 p-0 font-inherit text-inherit'>{t('login.createAccount')}</button>
              : <button type='button' onClick={()=>setCurrentState('Login')} className='cursor-pointer bg-transparent border-0 p-0 font-inherit text-inherit'>{t('login.loginHere')}</button>
            }
        </div>
        <button className='bg-ink text-paper font-light px-8 py-2 mt-4'>{currentState === 'Login' ? t('login.signInButton') : t('login.signUpButton')}</button>

        <div className='flex items-center gap-4 w-full my-2'>
            <hr className='flex-1 border-line' />
            <span className='text-stone text-sm'>{t('login.or')}</span>
            <hr className='flex-1 border-line' />
        </div>
        
        <div className='w-full flex justify-center'>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              text="continue_with"
              shape="rectangular"
              width="300"
            />
        </div>
    </form>
  )
}

export default Login
