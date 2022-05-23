import {Policy, Prisma} from "@prisma/client"
import {applicationLogger} from "../middlewares/logger.middleware"
import {Context} from "../global/context"
import {now} from "../util/util"
import {getContext} from "../db/prisma.client"
import {TODO} from "../exceptions"

export type Pager = {
  start: number,
  limit: number
}
export type CreatePolicyRequest = Omit<Prisma.PolicyCreateInput, "customer" | "createdAt"> & { customerId: string }
export type SearchPolicyRequest = {
  query?: string,
  pager?: Pager
}

export type DeletePolicyRequest = {
  id: string
}

export type UpdatePolicyRequest = {
  id: string,
  policy: Omit<Prisma.PolicyUpdateInput, "id" | "customer">
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

  public createPolicy = (policy: CreatePolicyRequest): Promise<Policy> => {
    applicationLogger.info("Creating policy for input", policy)
    return this._context.prisma.policy.create({
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

  public deletePolicy = (deleteRequest: DeletePolicyRequest) => {
    applicationLogger.debug("Deleting policies for input", deleteRequest)
    const deleted = this._context.prisma.policy.delete({
      where: {
        id: deleteRequest.id
      },
    })
  }

  public updatePolicy = (updateRequest: UpdatePolicyRequest) => {
    applicationLogger.debug("Updating policies for input", updateRequest)
    throw new TODO()
  }

  public searchPolicies = (search: SearchPolicyRequest = {}) => {
    applicationLogger.debug("Searching policies for input", search)
    const query = this._parseWhereInput(search);
    return this._context.prisma.policy.findMany({
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
