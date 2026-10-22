<script setup lang="ts">
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const expandedItems = ['second']
</script>

<template>
  <section class="accordion-showcase" aria-labelledby="accordion-showcase-title">
    <h2 id="accordion-showcase-title">Accordion</h2>

    <Accordion type="multiple" :default-value="expandedItems" aria-label="Three-item accordion">
      <AccordionItem value="first">
        <AccordionTrigger>First section</AccordionTrigger>
        <AccordionContent>
          <p>Several sections can stay open at the same time.</p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="second">
        <AccordionTrigger>Second section</AccordionTrigger>
        <AccordionContent>
          <p>This section is expanded by default. Use the arrow keys to move between triggers.</p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="third">
        <AccordionTrigger>Third section</AccordionTrigger>
        <AccordionContent>
          <p>Each section can be expanded or collapsed independently.</p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>

    <h3>Disabled item</h3>
    <Accordion type="multiple" aria-label="Disabled accordion item">
      <AccordionItem value="disabled" disabled>
        <AccordionTrigger>Disabled section</AccordionTrigger>
        <AccordionContent>This content cannot be expanded.</AccordionContent>
      </AccordionItem>
    </Accordion>
  </section>
</template>

<style scoped>
.accordion-showcase {
  display: flex;
  width: min(100%, 528px);
  flex-direction: column;
  gap: var(--primitives-padding-2);
}

h2,
h3,
p {
  margin: 0;
}

h2 {
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-lg);
  font-weight: 600;
}

h3 {
  margin-top: var(--primitives-padding-4);
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 600;
}
</style>
