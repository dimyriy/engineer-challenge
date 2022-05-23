import {Request, Response} from "express/ts4.0"
import {PoliciesService} from "../service/policies.service"
import {applicationLogger} from "../middlewares/logger.middleware"
import {TODO} from "../exceptions"

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
    throw new TODO()
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
