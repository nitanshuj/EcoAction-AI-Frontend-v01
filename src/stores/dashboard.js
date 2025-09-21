import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDashboardStore = defineStore('dashboard', () => {
  const carbonFootprint = ref(0)
  const challenges = ref([])
  const recommendations = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchDashboardData = async (userId) => {
    loading.value = true
    error.value = null

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock carbon footprint data
      carbonFootprint.value = Math.floor(Math.random() * 5000) + 2000 // 2000-7000 kg CO2/year

      // Mock challenges data
      challenges.value = [
        {
          id: 1,
          title: 'Bike to Work Week',
          description: 'Use bicycle for commuting for 5 days',
          progress: 60,
          target: 5,
          current: 3,
          status: 'active',
          category: 'transport'
        },
        {
          id: 2,
          title: 'Plant-Based Meals',
          description: 'Eat vegetarian/vegan meals for 10 days',
          progress: 40,
          target: 10,
          current: 4,
          status: 'active',
          category: 'food'
        },
        {
          id: 3,
          title: 'Energy Saver',
          description: 'Reduce electricity usage by 20%',
          progress: 75,
          target: 20,
          current: 15,
          status: 'active',
          category: 'energy'
        }
      ]

      // Mock recommendations
      recommendations.value = [
        {
          id: 1,
          title: 'Switch to LED Bulbs',
          description: 'Replace incandescent bulbs with LED alternatives',
          impact: 'Save 75% energy on lighting',
          category: 'energy',
          difficulty: 'Easy',
          savings: '200 kg CO2/year'
        },
        {
          id: 2,
          title: 'Use Public Transport',
          description: 'Take public transport 2 days per week',
          impact: 'Reduce transport emissions by 30%',
          category: 'transport',
          difficulty: 'Medium',
          savings: '500 kg CO2/year'
        },
        {
          id: 3,
          title: 'Reduce Meat Consumption',
          description: 'Try plant-based meals 3 times per week',
          impact: 'Lower food carbon footprint by 20%',
          category: 'food',
          difficulty: 'Medium',
          savings: '400 kg CO2/year'
        },
        {
          id: 4,
          title: 'Smart Thermostat',
          description: 'Install a programmable thermostat',
          impact: 'Optimize heating and cooling efficiency',
          category: 'energy',
          difficulty: 'Hard',
          savings: '800 kg CO2/year'
        }
      ]

    } catch (err) {
      error.value = err.message || 'Failed to load dashboard data'
    } finally {
      loading.value = false
    }
  }

  const updateCarbonFootprint = async (userId, newFootprint) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))

      carbonFootprint.value = newFootprint
      return { success: true }
    } catch (err) {
      error.value = err.message || 'Failed to update carbon footprint'
      return { success: false, error: err.message }
    }
  }

  const updateChallengeProgress = async (challengeId, progress) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300))

      const challenge = challenges.value.find(c => c.id === challengeId)
      if (challenge) {
        challenge.current = progress
        challenge.progress = (progress / challenge.target) * 100

        if (challenge.progress >= 100) {
          challenge.status = 'completed'
        }
      }

      return { success: true }
    } catch (err) {
      error.value = err.message || 'Failed to update challenge progress'
      return { success: false, error: err.message }
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    carbonFootprint,
    challenges,
    recommendations,
    loading,
    error,
    fetchDashboardData,
    updateCarbonFootprint,
    updateChallengeProgress,
    clearError
  }
})