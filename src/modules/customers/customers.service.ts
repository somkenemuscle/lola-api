import { Role } from '../../generated/prisma/enums.js'
import { type Pagination, paginationMeta, toSkipTake } from '../../lib/pagination.js'
import { prisma } from '../../lib/prisma.js'

export async function listCustomers(pagination: Pagination) {
  const where = { role: Role.CUSTOMER }
  const [customers, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: { id: true, fullName: true, email: true, createdAt: true },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      ...toSkipTake(pagination),
    }),
    prisma.user.count({ where }),
  ])

  return { customers, pagination: paginationMeta(pagination, total) }
}
