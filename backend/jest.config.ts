import type {Config} from "@jest/types"

const config: Config.InitialOptions = {
  verbose: true,
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  globalSetup: './test/global.setup.ts'
}
export default config
