import createHttpError from 'http-errors'
import { prisma } from '../../lib/prisma.js'
import type { CreateDeliveryLocationInput, UpdateDeliveryLocationInput } from './delivery-locations.schemas.js'

const alphabetical = { orderBy: { name: 'asc' } } as const

function locationNotFound() {
  return createHttpError(404, 'Delivery location not found')
}

// "Lagos Island" and "lagos island" would look like duplicates in the dropdown.
async function ensureNameAvailable(name: string, excludeId?: string) {
  const clash = await prisma.deliveryLocation.findFirst({
    where: { name: { equals: name, mode: 'insensitive' }, id: excludeId ? { not: excludeId } : undefined },
    select: { id: true },
  })

  if (clash) {
    throw createHttpError(409, `A delivery location named "${name}" already exists`)
  }
}

export function listAdminLocations() {
  return prisma.deliveryLocation.findMany(alphabetical)
}

export function listActiveLocations() {
  return prisma.deliveryLocation.findMany({
    where: { isActive: true },
    select: { id: true, name: true, fee: true },
    ...alphabetical,
  })
}

export async function createLocation(input: CreateDeliveryLocationInput) {
  await ensureNameAvailable(input.name)
  return prisma.deliveryLocation.create({ data: input })
}

export async function updateLocation(id: string, input: UpdateDeliveryLocationInput) {
  const existing = await prisma.deliveryLocation.findUnique({ where: { id }, select: { id: true } })

  if (!existing) {
    throw locationNotFound()
  }

  if (input.name) {
    await ensureNameAvailable(input.name, id)
  }

  return prisma.deliveryLocation.update({ where: { id }, data: input })
}

// Safe to delete outright: orders will keep their own copy of the location name and fee.
export async function deleteLocation(id: string) {
  const { count } = await prisma.deliveryLocation.deleteMany({ where: { id } })

  if (count === 0) {
    throw locationNotFound()
  }
}
