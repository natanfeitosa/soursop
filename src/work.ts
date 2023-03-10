import { commitRoot } from "./commiters"
import globals, { Fragment } from "./globals"
import { updateFragmentComponent, updateFunctionComponent, updateHostComponent } from "./reconcilers"
import type { Fiber } from "./types"
import { isFunctionComponent } from "./utils"

export function workLoop(deadline: IdleDeadline) {
  let shouldYield = false
  while (globals.nextUnitOfWork && !shouldYield) {
    globals.nextUnitOfWork = performUnitOfWork(
      globals.nextUnitOfWork
    )
    shouldYield = deadline.timeRemaining() < 1
  }

  if (!globals.nextUnitOfWork && globals.wipRoot) {
    commitRoot()
  }

  requestIdleCallback(workLoop)
}

// requestIdleCallback(workLoop)

export function performUnitOfWork(fiber: Fiber) {
  if (isFunctionComponent(fiber)) {
    updateFunctionComponent(fiber)
  } else if (fiber.type == Fragment) {
    updateFragmentComponent(fiber)
  } else {
    updateHostComponent(fiber)
  }
  if (fiber.child) {
    return fiber.child
  }
  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent as Fiber
  }
}