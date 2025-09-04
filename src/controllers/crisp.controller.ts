import { Request, Response } from 'express'
import { CRISP_TOPIC } from 'src/constants/crisp.constant'
import { processMessage } from 'src/services/crisp.service'

export async function crispWebhook(req: Request, res: Response) {
  try {
    const { event, data } = req.body

    if (!CRISP_TOPIC.includes(event)) {
      return res.status(200).json({ status: 'ignored' })
    }

    if (!data?.session_id) {
      return res.status(400).json({ error: 'Missing session_id' })
    }

    await processMessage(event, data)
    
    res.status(200).json({ status: 'received' })
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(500).json({ error: 'Processing failed' })
  }
}