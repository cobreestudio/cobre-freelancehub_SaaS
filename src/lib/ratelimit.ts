import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const aiRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, '1 h'),
  analytics: true,
  prefix: 'freelancehub:ai',
})
