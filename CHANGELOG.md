# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
