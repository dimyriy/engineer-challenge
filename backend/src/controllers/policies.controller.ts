import {Request, Response} from "express/ts4.0"
import {PoliciesService, PoliciesValidator, UpdatePolicyRequest} from "../service/policies.service"
import {applicationLogger} from "../middlewares/logger.middleware"
import {BadRequestException, TODO} from "../exceptions"
import {Policy} from "@prisma/client"

export class PoliciesController {
  private _policiesService

  constructor(policiesService: PoliciesService) {
    this._policiesService = policiesService
  }

  public get = async (req: Request, res: Response) => {
    applicationLogger.debug("Got GET request", req, res)
    const search = {query: req.query.toString()}

    const policies = await this._policiesService.searchPolicies(search)
    res.json(policies)
  }

  public put = async (req: Request, res: Response) => {
    applicationLogger.debug("Got PUT request", req, res)
    const id: string = req.params.id
    const policy: Policy = {...req.body}
    PoliciesValidator.validateId(id)
    if (!id || !policy) {
      throw new BadRequestException("id should be provided in param and policy should be provided in body")
    }
    const result = await this._policiesService.updatePolicy(<UpdatePolicyRequest>{
      id: id,
      policy: policy
    })
  }

  public delete = async (req: Request, res: Response) => {
    applicationLogger.debug("Got DELETE request", req, res)
    throw new TODO()
  }

  public getHistory = async (req: Request, res: Response) => {
    applicationLogger.debug("Got GET history request", req, res)
    throw new TODO()
  }

  public post = async (req: Request, res: Response) => {
    applicationLogger.debug("Got POST request", req, res)
    throw new TODO()
  }
}
