import {Context} from "../../src/global/context"
import {applicationLogger} from "../../src/middlewares/logger.middleware"
import {now} from "../../src/util/util"
import {InsuranceType, Policy, PolicyStatus} from "@prisma/client"
import {getContext} from "../../src/db/prisma.client"
import {CustomerService} from "../../src/service/customer.service"
import {FamilyMembers} from "../../src/service/policies.service"

export const cleanupDB = async (context: Context) => {
  const [policies, customers, policyHistories] = await context.prisma.$transaction([
    context.prisma.policyHistory.deleteMany({}),
    context.prisma.policy.deleteMany({}),
    context.prisma.customer.deleteMany({})
  ])
  applicationLogger.debug("Cleaning up DB, deleted entries", policies, customers, policyHistories)
}

export const createPolicy = async (customerId: string, familyMembers?: FamilyMembers): Promise<Policy> => {
  return getContext().prisma.policy.create({
    data: {
      startDate: now(),
      status: PolicyStatus.ACTIVE,
      provider: "feather",
      insuranceType: InsuranceType.HEALTH,
      familyMembers: familyMembers,
      customer: {
        connect: {
          id: customerId
        }
      }
    }
  }).then(created => {
    return {
      ...created as unknown as Policy
    }
  })
}

export const createPolicies = async (count: number, customerId: string): Promise<unknown> => {
  const timestamp = now()
  const policies = []
  for (let i = 0; i < count; i++) {
    policies.push({
      endDate: null,
      startDate: timestamp,
      status: PolicyStatus.ACTIVE,
      provider: "feather",
      insuranceType: InsuranceType.HEALTH,
      customerId: customerId
    })
  }
  return await getContext().prisma.policy.createMany({
    data: policies
  })
}

export const createCustomer = async (): Promise<string> => {
  return (await new CustomerService(getContext()).createCustomer({
    firstName: "John",
    lastName: "Smith",
    dateOfBirth: now()
  })).id
}
