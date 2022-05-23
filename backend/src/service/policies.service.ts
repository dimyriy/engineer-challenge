import {Policy, Prisma} from "@prisma/client"
import {applicationLogger} from "../middlewares/logger.middleware"
import {Context} from "../global/context"
import {now} from "../util/util"
import {getContext} from "../db/prisma.client"
import {NotFoundException} from "../exceptions"

const notFoundCode: string = 'P2025'

export type Pager = {
  start: number,
  limit: number
}

export type CreatePolicyRequest = Omit<Prisma.PolicyCreateInput, "customer" | "createdAt"> & { customerId: string }

export type SearchPolicyRequest = {
  query?: string,
  field?: string,
  pager?: Pager
}

export type DeletePolicyRequest = {
  id: string
}

export type UpdatePolicyRequest = {
  id: string,
  policy: Omit<Prisma.PolicyUpdateInput, "id" | "customer" | "createdAt">
}

export class PoliciesService {
  private _context: Context

  constructor(context: Context = getContext()) {
    this._context = context
  }

  public _parseWhereInput = (search: SearchPolicyRequest): Prisma.PolicyWhereInput => {
    return search.query
      ? {
        OR: [
          {provider: {contains: search.query, mode: "insensitive"}},
          {customer: {firstName: {contains: search.query, mode: "insensitive"}}},
          {customer: {lastName: {contains: search.query, mode: "insensitive"}}}
        ]
      }
      : {}
  }

  public createPolicy = async (policy: CreatePolicyRequest): Promise<Policy> => {
    applicationLogger.info("Creating policy for input", policy)
    return await this._context.prisma.policy.create({
      data: {
        createdAt: now(),
        endDate: policy.endDate,
        startDate: policy.startDate,
        status: policy.status,
        provider: policy.provider,
        insuranceType: policy.insuranceType,
        customer: {
          connect: {
            id: policy.customerId
          }
        }
      }
    })
  }

  public deletePolicy = async (deleteRequest: DeletePolicyRequest): Promise<Policy> => {
    applicationLogger.debug("Deleting policies for input", deleteRequest)
    return await this._context.prisma.policy.delete({
      where: {
        id: deleteRequest.id
      },
    }).catch(e => {
      applicationLogger.error("Got error while removing policy", e)
      if (e.hasOwnProperty('code') && e.code === notFoundCode) {
        throw new NotFoundException("Policy with id " + deleteRequest.id + " not found")
      } else {
        throw e
      }
    })
  }

  public updatePolicy = async (updateRequest: UpdatePolicyRequest): Promise<Policy> => {
    applicationLogger.debug("Updating policies for input", updateRequest)
    return await this._context.prisma.$transaction(async (tx) => {
      const existingPolicy = await tx.policy.findUnique({
        where: {
          id: updateRequest.id
        }
      })
      applicationLogger.debug("Updating policy value", existingPolicy)
      if (!existingPolicy) {
        throw new NotFoundException("Policy with id " + updateRequest.id + " not found")
      }
      return await tx.policy.update({
        where: {
          id: updateRequest.id
        },
        data: {
          endDate: updateRequest.policy.endDate,
          startDate: updateRequest.policy.startDate,
          status: updateRequest.policy.status,
          provider: updateRequest.policy.provider,
          insuranceType: updateRequest.policy.insuranceType,
        }
      })
    })
  }

  public searchPolicies = async (search: SearchPolicyRequest = {}) => {
    applicationLogger.debug("Searching policies for input", search)
    const query = this._parseWhereInput(search);
    return await this._context.prisma.policy.findMany({
      where: {
        ...query
      },
      select: {
        id: true,
        provider: true,
        insuranceType: true,
        status: true,
        startDate: true,
        endDate: true,
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true
          }
        }
      }
    })
  }
}
