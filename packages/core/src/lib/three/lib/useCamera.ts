import { onDestroy } from 'svelte'
import type { OrthographicCamera, Camera, PerspectiveCamera } from 'three'
import { useThrelte } from '../../hooks/useThrelte'
import { useThrelteRoot } from '../../hooks/useThrelteRoot'
import type { Size } from '../../types/types'

const isCamera = (value: any): value is Camera => {
  return value && value.isCamera
}

const isOrthographicCamera = (value: any): value is OrthographicCamera => {
  return value && value.isOrthographicCamera
}

const isPerspectiveCamera = (value: any): value is PerspectiveCamera => {
  return value && value.isPerspectiveCamera
}

const isPerspectiveCameraOrOrthographicCamera = (
  value: any
): value is PerspectiveCamera | OrthographicCamera => {
  return isPerspectiveCamera(value) || isOrthographicCamera(value)
}

export const useCamera = () => {
  const { invalidate, size } = useThrelte()
  const { setCamera } = useThrelteRoot()

  let currentInstance: PerspectiveCamera | OrthographicCamera | undefined
  let unsubscribe: (() => void) | undefined = undefined
  onDestroy(() => {
    unsubscribe?.()
  })

  const subscriber = (size: Size) => {
    if (!currentInstance) return

    if (isOrthographicCamera(currentInstance)) {
      currentInstance.left = size.width / -2
      currentInstance.right = size.width / 2
      currentInstance.top = size.height / 2
      currentInstance.bottom = size.height / -2
      currentInstance.updateProjectionMatrix()
      currentInstance.updateMatrixWorld()
      invalidate()
    } else if (isPerspectiveCamera(currentInstance)) {
      currentInstance.aspect = size.width / size.height
      currentInstance.updateProjectionMatrix()
      currentInstance.updateMatrixWorld()
      invalidate()
    }
  }

  const update = <T>(instance: T, manual: boolean) => {
    unsubscribe?.()
    if (manual || !isPerspectiveCameraOrOrthographicCamera(instance)) {
      currentInstance = undefined
      return
    }
    currentInstance = instance
    unsubscribe = size.subscribe(subscriber)
  }

  const makeDefaultCamera = <T>(instance: T, makeDefault: boolean) => {
    if (!isCamera(instance) || !makeDefault) return
    setCamera(instance)
    invalidate()
  }

  return {
    update,
    makeDefaultCamera
  }
}
