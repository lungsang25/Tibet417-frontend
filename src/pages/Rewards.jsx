import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'

/**
 * Balance, pending points, referral link, and history for the Redeemable
 * Bonus Program. Sections for a program that is currently inactive
 * (GET /api/bonus/meta) are hidden rather than shown disabled — an admin
 * that hasn't switched referral on yet shouldn't have customers staring at
 * a dead "refer a friend" panel.
 */
const Rewards = () => {
  const { t } = useTranslation('rewards')
  const { token, backendUrl, navigate } = useContext(ShopContext)
  const [meta, setMeta] = useState(null)
  const [balance, setBalance] = useState(null)
  const [history, setHistory] = useState({ rows: [], total: 0 })
  const [referral, setReferral] = useState(null)
  const [status, setStatus] = useState('loading')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    let cancelled = false

    const load = async () => {
      setStatus('loading')
      try {
        const metaRes = await axios.get(backendUrl + '/api/bonus/meta')
        if (cancelled) return
        const metaData = metaRes.data?.success ? metaRes.data : null
        setMeta(metaData)

        const calls = [
          axios.post(backendUrl + '/api/bonus/balance', {}, { headers: { token } }),
          axios.post(backendUrl + '/api/bonus/history', { page: 1, limit: 25 }, { headers: { token } }),
        ]
        if (metaData?.referral?.active) {
          calls.push(axios.post(backendUrl + '/api/bonus/referral', {}, { headers: { token } }))
        }

        const [balanceRes, historyRes, referralRes] = await Promise.all(calls)
        if (cancelled) return

        if (balanceRes.data.success) setBalance(balanceRes.data)
        if (historyRes.data.success) setHistory(historyRes.data)
        if (referralRes?.data?.success) setReferral(referralRes.data)

        setStatus('ready')
      } catch (error) {
        console.log(error)
        if (!cancelled) setStatus('error')
      }
    }

    load()
    return () => { cancelled = true }
  }, [token])

  const copyLink = async () => {
    if (!referral?.referralLink) return
    try {
      await navigator.clipboard.writeText(referral.referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.log(error)
      toast.error(t('referral.copyFailed'))
    }
  }

  if (status === 'loading') {
    return <div className='min-h-[50vh] flex items-center justify-center'><p className='text-stone text-sm'>{t('loading')}</p></div>
  }

  if (status === 'error') {
    return <div className='min-h-[50vh] flex items-center justify-center'><p className='text-stone text-sm'>{t('loadFailed')}</p></div>
  }

  const anyActive = meta && (meta.welcome?.active || meta.referral?.active || meta.purchase?.active)

  return (
    <div className='pt-5 sm:pt-14 pb-16 min-h-[60vh]'>
      <div className='text-xl sm:text-2xl mb-6'>
        <Title text1={t('heading.text1')} text2={t('heading.text2')} as='h1' />
      </div>

      {!anyActive && (
        <p className='text-sm text-stone border border-line rounded p-4 mb-8'>{t('notActive')}</p>
      )}

      <div className='grid sm:grid-cols-2 gap-4 mb-10'>
        <div className='border border-line rounded p-5'>
          <p className='text-xs text-stone uppercase tracking-wide mb-1'>{t('balance.confirmed')}</p>
          <p className='text-3xl font-medium text-ink'>{balance?.confirmed ?? 0}</p>
          <p className='text-xs text-stone mt-1'>{t('balance.pointsUnit')}</p>
        </div>
        <div className='border border-line rounded p-5'>
          <p className='text-xs text-stone uppercase tracking-wide mb-1'>{t('balance.pending')}</p>
          <p className='text-3xl font-medium text-stone'>{balance?.pending ?? 0}</p>
          <p className='text-xs text-stone mt-1'>{t('balance.pendingNote')}</p>
        </div>
      </div>

      {meta?.referral?.active && referral && (
        <div className='border border-line rounded p-5 mb-10'>
          <h2 className='text-lg mb-1'>{t('referral.heading')}</h2>
          <p className='text-sm text-stone mb-4'>{t('referral.description')}</p>
          <div className='flex flex-col sm:flex-row gap-2'>
            <input
              readOnly
              value={referral.referralLink}
              onFocus={(e) => e.target.select()}
              className='flex-1 border border-line rounded px-3 py-2 text-sm bg-gray-50'
            />
            <button type='button' onClick={copyLink} className='bg-ink text-paper px-5 py-2 text-sm whitespace-nowrap'>
              {copied ? t('referral.copied') : t('referral.copy')}
            </button>
          </div>
          <p className='text-xs text-stone mt-3'>
            {t('referral.stats', { referred: referral.referredCount, converted: referral.convertedCount })}
          </p>
        </div>
      )}

      <div>
        <h2 className='text-lg mb-3'>{t('history.heading')}</h2>
        {history.rows.length === 0 ? (
          <p className='text-sm text-stone'>{t('history.empty')}</p>
        ) : (
          <div className='flex flex-col divide-y divide-line border-t border-b border-line'>
            {history.rows.map((row) => (
              <div key={row._id} className='flex items-center justify-between py-3 text-sm gap-3'>
                <div>
                  <p>{t(`history.types.${row.type}`, row.type)}</p>
                  <p className='text-xs text-stone'>{new Date(row.date).toLocaleDateString()}</p>
                </div>
                <div className='text-right shrink-0'>
                  <p className={row.points >= 0 ? 'text-green-700' : 'text-red-600'}>
                    {row.points >= 0 ? '+' : ''}{row.points}
                  </p>
                  <p className='text-xs text-stone'>{t(`history.status.${row.status}`, row.status)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Rewards
