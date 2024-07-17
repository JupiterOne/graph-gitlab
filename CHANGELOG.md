# v4.10.0 (Wed Jul 17 2024)

#### 🚀 Enhancement

- upgrade sdk [#116](https://github.com/JupiterOne/graph-gitlab/pull/116) ([@RonaldEAM](https://github.com/RonaldEAM))

#### Authors: 1

- Ronald Arias ([@RonaldEAM](https://github.com/RonaldEAM))

---

# v4.9.0 (Fri May 17 2024)

#### 🚀 Enhancement

- Add system version to gitlab_account entity [#115](https://github.com/JupiterOne/graph-gitlab/pull/115) ([@VDubber](https://github.com/VDubber))

#### 🐛 Bug Fix

- Update Dockerfile [#114](https://github.com/JupiterOne/graph-gitlab/pull/114) ([@zemberdotnet](https://github.com/zemberdotnet))
- INT-10174: Change action to be an array [#113](https://github.com/JupiterOne/graph-gitlab/pull/113) ([@maxheckel](https://github.com/maxheckel))

#### ⚠️ Pushed to `main`

- Apply remove-codeql with multi-gitter [ci skip] ([@electricgull](https://github.com/electricgull))

#### Authors: 4

- [@maxheckel](https://github.com/maxheckel)
- Cameron Griffin ([@electricgull](https://github.com/electricgull))
- Matthew Zember ([@zemberdotnet](https://github.com/zemberdotnet))
- Samuel Poulton ([@VDubber](https://github.com/VDubber))

---

# v4.8.1 (Thu Apr 25 2024)

#### 🐛 Bug Fix

- Update Dockerfile [#114](https://github.com/JupiterOne/graph-gitlab/pull/114) ([@zemberdotnet](https://github.com/zemberdotnet))
- INT-10174: Change action to be an array [#113](https://github.com/JupiterOne/graph-gitlab/pull/113) ([@maxheckel](https://github.com/maxheckel))

#### ⚠️ Pushed to `main`

- Apply remove-codeql with multi-gitter [ci skip] ([@electricgull](https://github.com/electricgull))

#### Authors: 3

- [@maxheckel](https://github.com/maxheckel)
- Cameron Griffin ([@electricgull](https://github.com/electricgull))
- Matthew Zember ([@zemberdotnet](https://github.com/zemberdotnet))

---

# v4.8.0 (Wed Dec 06 2023)

#### 🚀 Enhancement

- INT-10098 - ingest project labels [#112](https://github.com/JupiterOne/graph-gitlab/pull/112) ([@RonaldEAM](https://github.com/RonaldEAM))

#### ⚠️ Pushed to `main`

- Fix x-cortex-service-groups where tier-4 was set incorrectly ([@jablonnc](https://github.com/jablonnc))

#### Authors: 2

- Noah Jablonski ([@jablonnc](https://github.com/jablonnc))
- Ronald Arias ([@RonaldEAM](https://github.com/RonaldEAM))

---

# v4.7.0 (Wed Nov 29 2023)

#### 🚀 Enhancement

- INT-9953 - add accessLevel property to project -HAS-> user relationship [#111](https://github.com/JupiterOne/graph-gitlab/pull/111) ([@RonaldEAM](https://github.com/RonaldEAM))

#### 🐛 Bug Fix

- Make field optional so SDK does not error [#110](https://github.com/JupiterOne/graph-gitlab/pull/110) ([@maxheckel](https://github.com/maxheckel))
- package bump [#109](https://github.com/JupiterOne/graph-gitlab/pull/109) ([@zemberdotnet](https://github.com/zemberdotnet))

#### ⚠️ Pushed to `main`

- Populate CODEOWENRS, baseline package.json and baseline cortex.yaml ([@jablonnc](https://github.com/jablonnc))

#### Authors: 4

- [@maxheckel](https://github.com/maxheckel)
- Matthew Zember ([@zemberdotnet](https://github.com/zemberdotnet))
- Noah Jablonski ([@jablonnc](https://github.com/jablonnc))
- Ronald Arias ([@RonaldEAM](https://github.com/RonaldEAM))

---

# v4.6.3 (Wed Jul 26 2023)

#### 🐛 Bug Fix

- package bump [#109](https://github.com/JupiterOne/graph-gitlab/pull/109) ([@zemberdotnet](https://github.com/zemberdotnet))

#### Authors: 1

- Matthew Zember ([@zemberdotnet](https://github.com/zemberdotnet))

---

# v4.6.2 (Fri Jun 30 2023)

#### 🐛 Bug Fix

- Create Packages from Integration [#104](https://github.com/JupiterOne/graph-gitlab/pull/104) ([@jmountifield](https://github.com/jmountifield))
- INT-7286: add full name to schema [#107](https://github.com/JupiterOne/graph-gitlab/pull/107) ([@mishelashala](https://github.com/mishelashala))

#### Authors: 2

- James Mountifield ([@jmountifield](https://github.com/jmountifield))
- Michell Ayala ([@mishelashala](https://github.com/mishelashala))

---

# v4.6.1 (Mon Jun 19 2023)

#### 🐛 Bug Fix

- INT-6664: update errors [#106](https://github.com/JupiterOne/graph-gitlab/pull/106) ([@gastonyelmini](https://github.com/gastonyelmini))

#### Authors: 1

- Gaston Yelmini ([@gastonyelmini](https://github.com/gastonyelmini))

---

# v4.6.0 (Thu Jun 15 2023)

#### 🚀 Enhancement

- INT-6664: ingest GitLab vulnerability findings [#105](https://github.com/JupiterOne/graph-gitlab/pull/105) ([@gastonyelmini](https://github.com/gastonyelmini))

#### 🐛 Bug Fix

- Update integration-deployment.yml [#103](https://github.com/JupiterOne/graph-gitlab/pull/103) ([@Nick-NCSU](https://github.com/Nick-NCSU))

#### Authors: 2

- Gaston Yelmini ([@gastonyelmini](https://github.com/gastonyelmini))
- Nick Thompson ([@Nick-NCSU](https://github.com/Nick-NCSU))

---

## 4.4.4 - 2023-05-15

## Added

- Added `auto` package to help with builds, versioning and npm packaging

## 4.4.3 - 2023-03-14

## Changed

- Changed what we do on validate invocation to distinguish two diferent things:

  1. When base URL is wrong
  2. When personalToken is wrong.

- Added some new tests and checks for undefined cases on some steps
  (group-user-relationships & project-user-relationships).

## 4.4.2 - 2023-03-14

## Changed

- Due to how the `/users/*` API handles rate limiting, add logic to wait 10
  minutes if we encounter a 429 in the `fetch-users` step
- Updated `@jupiterone/integration-sdk-*` packages to `v8.30.5`
- Introduced new SDK testing patterns for `fetch-users` step

## 4.4.1 - 2022-12-06

## Changed

- Changed the users fetching to be sequential as a solution for the rate
  limiting issue.

## 4.4.0 - 2022-11-01

## Added

- Added `topics` property to `gitlab_project` entities.

## 4.3.3 - 2022-04-21

## Added

- Added additional logging for insight into rate limiting issues.

## 4.3.2 - 2022-04-19

### Added

- Added retry and rate limit logic to GitlabClient.ts

## 4.3.1 - 2022-02-21

### Fixed

- Commits related to multiple MRs are now no longer causing a duplicate key
  error.

## 4.3.0 - 2022-02-18

### Added

- Commits for MRs are now added. They are only related to MRs at this time, as
  the required data doesn't exist to have a durable relationship creation
  process between users and commits.

| Source Entity `_type` | Relationship `_class` | Target Entity `_type` | |
`gitlab_merge_request` | **HAS** | `gitlab_commit` |

## 4.2.0 - 2022-01-21

### Fixed

- Relationship between merge request and project is now being created.

## 4.1.0 - 2021-01-20

- New properties added to resources:

  | Entity                 | Properties      |
  | ---------------------- | --------------- |
  | `gitlab_merge_request` | `commitWebLink` |

### Changed

- Rename `gitlab_merge_request` properties
  - `mergedAt` -> `mergedOn`
  - `closedAt` -> `closedOn`

## 3.0.0 - 2021-01-19

### Added

- New properties added to resources:

  | Entity                 | Properties                                                                      |
  | ---------------------- | ------------------------------------------------------------------------------- |
  | `gitlab_merge_request` | `mergedAt`, `closedAt`, `sha`, `mergeCommitSha`, `squashCommitSha`, `updatedOn` |
  | `gitlab_user`          | `active`                                                                        |

- Upgrade SDK packages
- Bump version of Node.js in GitHub workflow to 14.x

## 2.5.0 2021-04-05

### Changed

- Upgrade dependencies

## 2.4.0 2020-11-17

### Added

- Added properties to merge request entities: `approved`, `approvers` (names of
  persons who approved), `approverIds`, and `approverLogins`.
- Raw data of merge requests now include `approval` resource.

## 2.3.0 2020-11-12

### Added

- `allowMergeOnSkippedPipeline` to project entities.

### Fixed

- A `403` response to requests for project merge requests would kill all merge
  request ingestion.

## 2.2.2 2020-11-11

### Added

- Ingest projects of accessible groups in addition to projects owned by the
  configured user credentials.

## 2.2.1 2020-11-05

### Fixed

- Fix #3 - Unhandled authentication/authorization error in `validateInvocation`
- Fix #19 - Duplicate `gitlab_group_has_user` relationships
- Unhandled authentication/authorization error in resource API calls

## 2.2.0 2020-10-29

### Changed

- Upgrade SDK v4.0.1

## 2.1.2 2020-10-22

### Fixed

- [#15](https://github.com/JupiterOne/graph-gitlab/issues/15) - Deduplicate
  `gitlab_project_has_user` relationships

## 2.1.1 2020-06-30

### Fixed

- A group project not found in complete listing would cause `_type on undefined`
  error. That situation is now logged, no relationship is created to the
  project.
- Undeclared type warning for `gitlab_group_has_group`.

## 1.0.3 2020-05-14

### Changed

- Limit publishing to `dist` files

## 1.0.2 2020-05-14

🎉Initial release
